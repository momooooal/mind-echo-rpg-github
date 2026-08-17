import type { GameState } from "../types";

export type LifeStat = { label: string; value: string; tone?: "warm" | "plain" };

function seededOffset(seed: number, salt: number, span: number) {
  return Math.abs((seed ^ (salt * 2654435761)) >>> 0) % span;
}

export function createLifeStatistics(state: GameState): LifeStat[] {
  const counters = state.counters;
  const maskWeight = counters.pretendedOkay + counters.maskedAtWork * 2 + (state.flags.familySecrecy ? 2 : 0);
  const appointments = counters.onTimeAppointments + counters.hospitalTrips;
  return [
    { label: "假裝「沒事」", value: `${31 + maskWeight * 9 + seededOffset(state.seed, 1, 18)} 次` },
    { label: "明明很累還是去上班", value: `${18 + counters.workedWhileExhausted * 13 + seededOffset(state.seed, 2, 16)} 次` },
    { label: "臨時取消約會", value: `${counters.cancelledPlans * 4 + seededOffset(state.seed, 3, 8)} 次` },
    { label: "被說「你看起來很正常啊」", value: `${counters.maskedAtWork * 3 + seededOffset(state.seed, 4, 7)} 次` },
    { label: "成功準時回診", value: `${appointments * 6 + seededOffset(state.seed, 5, 9)} 次` },
    { label: "錯過回診", value: `${counters.missedAppointments + seededOffset(state.seed, 6, 5)} 次` },
    { label: "陪家人或自己跑醫院", value: `${counters.caregivingTrips + counters.hospitalTrips + seededOffset(state.seed, 13, 7)} 趟` },
    { label: "為了一份文件跑制度窗口", value: `${counters.bureaucracyTrips + seededOffset(state.seed, 14, 4)} 趟` },
    { label: "加入過的群組", value: `${state.flags.joinedGroup ? 3 : 1} 個` },
    { label: "真正說出「我現在不好」", value: `${counters.saidNotOkay * 4 + seededOffset(state.seed, 7, 6)} 次` },
    { label: "有人相信你的時候", value: `${counters.peopleBelieved * 5 + 9 + seededOffset(state.seed, 8, 11)} 次`, tone: "warm" },
    { label: "半夜跟病友講垃圾話", value: `${counters.lateNightJokes * 37 + counters.groupMessages * 8 + seededOffset(state.seed, 9, 31)} 次`, tone: "warm" },
    { label: "想不起來為什麼走進房間", value: `${counters.forgotWhy * 19 + 43 + seededOffset(state.seed, 10, 42)} 次` },
    { label: "完成自己真的很會做的專案", value: `${counters.projectsCompleted * 6 + seededOffset(state.seed, 11, 4)} 個`, tone: "warm" },
    { label: "笑到停不下來", value: `${counters.laughedHard * 11 + 34 + seededOffset(state.seed, 12, 24)} 次`, tone: "warm" },
    { label: "養活的植物", value: `${counters.plantsKeptAlive + 2} 盆`, tone: "warm" },
    { label: "吃到很好吃的東西", value: "不知道，很多次。", tone: "warm" },
  ];
}
