const {onSchedule} = require("firebase-functions/v2/scheduler");
const semesterRepository = require("../repository/semester.repository");
const stayRequestRepository = require("../repository/stayRequest.repository");
const entryLogRepository = require("../repository/entryLog.repository");
const penaltyRepository = require("../repository/penalty.repository");
const dayjs = require("dayjs");

const schedule = {
  schedule: "every day 00:30",
  timeZone: "Asia/Seoul",
  retryCount: 3,
  maxRetrySeconds: 60,
  region: "asia-northeast3",
};

/**
 * 벌점을 부여하는 스케줄 함수
 * - 무단 외박 학생 식별 및 벌점 부여
 * - 17시 이후 입실 학생 식별 및 벌점 부여
 */
async function scheduledTask() {
  const yesterday = dayjs().subtract(1, "day");
  const currentYear = yesterday.year();
  const currentMonth = yesterday.month() + 1;

  let semester;
  if (3 <= currentMonth && currentMonth <= 6) {
    semester = `${currentYear}-1`;
  } else if (9 <= currentMonth && currentMonth <= 12) {
    semester = `${currentYear}-2`;
  } else {
    throw new Error("현재는 방학입니다.");
  }
  // 현재 학기 학생 조회
  const students = await semesterRepository.findUserBySemester(semester);

  // 어제 외박 신청한 학생 조회 조회
  const formattedYesterday = yesterday.format("YYYY-MM-DD");
  const stayRequests = await stayRequestRepository.findByYesterday(formattedYesterday);

  // 어제 기숙사 출입 기록 조회
  const entryLogs = await entryLogRepository.findByYesterday(formattedYesterday);

  // 각 학생별 최종 입실 시간
  const latestEntryMap = new Map();
  entryLogs.forEach((log) => {
    const userId = log.userId;
    const timestamp = log.timestamp;

    if (!latestEntryMap.has(userId) ||
        dayjs(timestamp).isAfter(dayjs(latestEntryMap.get(userId)))) {
      latestEntryMap.set(userId, timestamp);
    }
  });

  // 벌점 대상자 식별
  const noEntryStudents = []; // 무단 외박 학생
  const lateEntryStudents = []; // 17시 이후 입실 학생

  const curfewTime = dayjs(`${formattedYesterday}T17:00:00`); // 통금 시간

  // 각 학생에 대해 확인
  for (const student of students) {
    const studentId = student.userId;
    // 승인된 외박 신청이 있으면 건너뜀.
    if (stayRequests.has(studentId)) {
      continue;
    }

    // 입실 기록이 없음 -> 외박 신청 없이 외박
    if (!latestEntryMap.has(studentId)) {
      noEntryStudents.push(studentId);
      continue;
    }

    // 17시 이후에 입실한 경우
    const latestEntryTime = dayjs(latestEntryMap.get(studentId));
    if (latestEntryTime.isAfter(curfewTime)) {
      lateEntryStudents.push({
        userId: studentId,
        entryTime: latestEntryMap.get(studentId),
      });
    }
  }

  await penaltyRepository.batchSave(formattedYesterday, noEntryStudents, lateEntryStudents);
}

exports.scheduledTask = onSchedule(schedule, scheduledTask);
