// Разширява затворения модел SeminarInstance

class GamifiedSeminarInstance {
  /**
   * @param {Object} instanceDoc - Оригиналният Mongoose документ SeminarInstance
   */
  constructor(instanceDoc) {
    this.instance = instanceDoc;
    
    // Геймификационни константи за събития на живо
    this.BASE_ATTENDANCE_XP = 100;
    this.PUNCTUALITY_BONUS = 50; 
    this.INTERACTION_XP = 20; // Точки на зададен въпрос
    this.PUNCTUALITY_WINDOW_MINUTES = 10;
  }

  /**
   * Feature 1: Изчислява XP за присъединяване към стрийма
   * Този метод се вика, когато потребителят кликне на URL-а за присъединяване.
   * @param {string} lessonId - ID на конкретната част от семинара
   * @param {Date} joinDate - Кога потребителят се е присъединил
   * @returns {Object} Обект с присъдени точки и съобщения
   */
  calculateAttendanceReward(lessonId, joinDate) {
    let earnedXP = this.BASE_ATTENDANCE_XP;
    let badge = null;
    let targetLesson = null;

    // Намираме лекцията
    for (const section of this.instance.curriculum) {
      const found = section.lessons.find(l => l._id.toString() === lessonId.toString());
      if (found) {
        targetLesson = section; // Данните за време са на ниво section/curriculum тук
        break;
      }
    }

    if (!targetLesson || !targetLesson.startDateTime) {
      return { earnedXP, badge };
    }

    // Проверяваме за точност
    const startTime = new Date(targetLesson.startDateTime);
    const diffInMinutes = (joinDate - startTime) / (1000 * 60);

    // Ако се е присъединил малко преди началото или до 10 мин след това
    if (diffInMinutes >= -30 && diffInMinutes <= this.PUNCTUALITY_WINDOW_MINUTES) {
      earnedXP += this.PUNCTUALITY_BONUS;
      badge = 'Front Row Student';
    }

    return { 
      earnedXP, 
      badge,
      message: badge ? 'Awesome! You arrived right on time.' : 'Welcome to the stream!'
    };
  }

  /**
   * Feature 2: Обработка на интеракция (напр. от Slido webhook)
   * @returns {number} Точки за проявена активност
   */
  rewardInteraction() {
    // Връщаме точки, само ако семинарът реално поддържа Slido
    if (this.instance.slidoCode) {
      return this.INTERACTION_XP;
    }
    return 0;
  }

  /**
   * Feature 3: Проверява дали тестът е решен в рамките на 24 часа (Fast Action Bonus)
   * @param {string} lessonId 
   * @param {Date} assessmentCompletionDate 
   * @returns {boolean} 
   */
  isAssessmentEligibleForRushBonus(lessonId, assessmentCompletionDate) {
    for (const section of this.instance.curriculum) {
      const foundLesson = section.lessons.find(l => l._id.toString() === lessonId.toString());
      
      if (foundLesson && foundLesson.assessment && section.endDateTime) {
        const endTime = new Date(section.endDateTime);
        const hoursDifference = (assessmentCompletionDate - endTime) / (1000 * 60 * 60);
        
        return hoursDifference >= 0 && hoursDifference <= 24;
      }
    }
    return false;
  }
}

export default GamifiedSeminarInstance;
