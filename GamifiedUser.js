// Разширява затворения модел User, действайки като Aggregate Root

class GamifiedUser {
  /**
   * @param {Object} userDoc - Оригиналният Mongoose документ User
   * @param {Object} gamificationData - Данни от отделна колекция (XP, badges, streaks)
   */
  constructor(userDoc, gamificationData = { xp: 0, badges: [], streakDays: 0 }) {
    this.user = userDoc;
    
    // Геймификационен стейт (състояние)
    this.xp = gamificationData.xp || 0;
    this.badges = gamificationData.badges || [];
    this.streakDays = gamificationData.streakDays || 0;
    
    // Формула за нива (напр. Ниво 1 = 0-499 XP, Ниво 2 = 500-1499 XP и т.н.)
    this.BASE_XP_REQUIREMENT = 500;
    this.LEVEL_MULTIPLIER = 1.5;
  }

  /**
   * Feature 1: Изчислява текущото ниво на база общия XP
   * @returns {number} Текущо ниво
   */
  getCurrentLevel() {
    let level = 1;
    let requiredXpForNextLevel = this.BASE_XP_REQUIREMENT;
    let xpPool = this.xp;

    while (xpPool >= requiredXpForNextLevel) {
      level++;
      xpPool -= requiredXpForNextLevel;
      requiredXpForNextLevel = Math.floor(requiredXpForNextLevel * this.LEVEL_MULTIPLIER);
    }

    return level;
  }

  /**
   * Feature 1: Добавя нов опит към профила и връща информация, ако има Level Up
   * @param {number} amount - Спечелени точки
   * @returns {Object} Информация за прогреса
   */
  addXP(amount) {
    const oldLevel = this.getCurrentLevel();
    this.xp += amount;
    const newLevel = this.getCurrentLevel();

    return {
      totalXp: this.xp,
      leveledUp: newLevel > oldLevel,
      newLevel: newLevel
    };
  }

  /**
   * Feature 2: Проверява дали потребителят може да участва в Leaderboard
   * @returns {boolean}
   */
  isEligibleForLeaderboard() {
    // Ако профилът е скрит (private === true), не го показваме
    return this.user.private === false;
  }

  /**
   * Feature 3: Проверява дали потребителят има право на менторски награди
   * @returns {boolean}
   */
  isEligibleForTeacherRewards() {
    // Според константите, очакваме роля 'teacher' или подобна
    const isTeacher = this.user.roles && this.user.roles.includes('teacher');
    const hasTaughtCourses = this.user.taughtCourseInstances && this.user.taughtCourseInstances.length > 0;
    
    return isTeacher && hasTaughtCourses;
  }

  /**
   * Добавя нова значка, ако потребителят вече не я притежава
   * @param {string} badgeName 
   */
  awardBadge(badgeName) {
    if (!this.badges.includes(badgeName)) {
      this.badges.push(badgeName);
      return true; // Успешно добавена
    }
    return false; // Вече я има
  }
}

export default GamifiedUser;
