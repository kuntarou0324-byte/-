export function getTodaySeasonContext(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month === 1 && day <= 7) return "お正月";
  if (month === 2 && day >= 1 && day <= 5) return "節分";
  if (month === 3 && day >= 1 && day <= 5) return "ひな祭り";
  if (month === 5 && day >= 3 && day <= 6) return "こどもの日・端午の節句";
  if (month === 7 && day >= 1 && day <= 7) return "七夕";
  if (month === 8 && day >= 13 && day <= 16) return "お盆";
  if (month === 9 && day >= 15 && day <= 23) return "敬老の日・十五夜";
  if (month === 10 && day >= 28) return "ハロウィン";
  if (month === 11 && day >= 13 && day <= 17) return "七五三";
  if (month === 12 && day >= 20 && day <= 25) return "クリスマス・冬至";
  if (month === 12 && day >= 28) return "年末";

  const seasonByMonth: Record<number, string> = {
    1: "冬・お正月明け",
    2: "冬・立春前後",
    3: "春のおとずれ",
    4: "春・お花見",
    5: "初夏・新緑",
    6: "梅雨",
    7: "夏・七夕",
    8: "夏・夏祭り",
    9: "秋の始まり",
    10: "秋・紅葉",
    11: "晩秋・紅葉",
    12: "冬・年末",
  };
  return seasonByMonth[month] ?? "";
}
