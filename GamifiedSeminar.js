// Разширява затворения модел Seminar за нуждите на геймификацията

class GamifiedSeminar {
  /**
   * @param {Object} seminarDoc - Mongoose документ от модела Seminar
   */
  constructor(seminarDoc) {
    this.seminar = seminarDoc;
    
    // Базови настройки за семинари
    this.BASE_SEMINAR_XP = 150; 
    this.INTERACTIVITY_MULTIPLIER = 1.3;
  }

  /**
   * Feature 1: Проверява дали семинарът е интерактивен (има Slido код)
   * @returns {boolean}
   */
  hasInteractiveElements() {
    if (!this.seminar.curriculum || this.seminar.curriculum.length === 0) {
      return false;
    }

    // Търсим поне една секция, която има валиден slidoCode
    return this.seminar.curriculum.some(section => 
      section.slidoCode && section.slidoCode.trim() !== ''
    );
  }

  /**
   * Feature 1: Изчислява максималния потенциален XP от този семинар
   * @returns {number}
   */
  calculatePotentialXP() {
    let totalXP = this.BASE_SEMINAR_XP;

    if (this.hasInteractiveElements()) {
      totalXP = Math.round(totalXP * this.INTERACTIVITY_MULTIPLIER);
    }

    return totalXP;
  }

  /**
   * Feature 3: Проверява дали събитието е архивирано (спряно)
   * @returns {boolean}
   */
  isLegacyEvent() {
    return this.seminar.active === false;
  }

  /**
   * Feature 2: Връща метаданни за категоризацията на събитието
   */
  getEventMetadata() {
    return {
      eventId: this.seminar._id || this.seminar.cid,
      eventType: 'SEMINAR',
      mainCategory: this.seminar.category || null,
      subCategory: this.seminar.subcategories || null,
      potentialXP: this.calculatePotentialXP(),
      isLegacy: this.isLegacyEvent()
    };
  }
}

export default GamifiedSeminar;
