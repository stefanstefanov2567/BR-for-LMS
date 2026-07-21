// Разширява затворения модел Survey за нуждите на геймификацията

class GamifiedSurvey {
  /**
   * @param {Object} surveyDoc - Оригиналният Mongoose документ Survey
   */
  constructor(surveyDoc) {
    this.survey = surveyDoc;
    
    // Базови геймификационни настройки
    this.BASE_SURVEY_XP = 50; 
    this.EARLY_BIRD_BONUS = 25;
    this.EARLY_BIRD_WINDOW_HOURS = 48; // Времеви прозорец за бонуса
  }

  /**
   * Feature 1 & 2: Изчислява наградата на потребителя за попълнена анкета
   * @param {string} userId - ID на потребителя
   * @param {Date} submissionDate - Дата на попълване (по подразбиране е сега)
   * @returns {Object} Награди (точки и тип събитие)
   */
  calculateReward(userId, submissionDate = new Date()) {
    // 1. Проверяваме дали потребителят реално е в масива с отговори
    const hasAnswered = this.survey.answers && this.survey.answers.some(
      answer => answer.user.toString() === userId.toString()
    );

    if (!hasAnswered) {
      return { totalXP: 0, eventType: null };
    }

    let totalXP = this.BASE_SURVEY_XP;
    let earnedBonus = false;

    // 2. Проверяваме за Early Bird бонус
    if (this.survey.activeFrom) {
      const startTime = new Date(this.survey.activeFrom);
      const hoursSinceStart = (submissionDate - startTime) / (1000 * 60 * 60);

      // Ако е попълнена преди да изтекат 48 часа от отварянето
      if (hoursSinceStart >= 0 && hoursSinceStart <= this.EARLY_BIRD_WINDOW_HOURS) {
        totalXP += this.EARLY_BIRD_BONUS;
        earnedBonus = true;
      }
    }

    return {
      totalXP,
      earnedBonus,
      message: earnedBonus ? 'Awesome! Thanks for the quick feedback!' : 'Thank you for your feedback!',
      eventType: 'COMMUNITY_CONTRIBUTION' // Това отива към GamifiedUser, за да отключи значка
    };
  }

  /**
   * Метод, който валидира дали анкетата въобще е активна за геймификация
   * @returns {boolean}
   */
  isEligibleForRewards(currentDate = new Date()) {
    const from = this.survey.activeFrom ? new Date(this.survey.activeFrom) : new Date(0);
    const until = this.survey.activeUntil ? new Date(this.survey.activeUntil) : new Date(8640000000000000); // Max Date

    return currentDate >= from && currentDate <= until;
  }
}

export default GamifiedSurvey;
