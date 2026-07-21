// Този клас разширява функционалността на затворения модел Course

class GamifiedCourse {
  /**
   * @param {Object} courseDoc - Инстанция на оригиналния Mongoose модел Course
   */
  constructor(courseDoc) {
    this.course = courseDoc;
    
    // Базови настройки за баланс на геймификацията
    this.XP_PER_LESSON = 50;
    this.COMPLETION_BONUS = 500;
    this.PIONEER_THRESHOLD = 50; // Първите 50 завършили получават бонус
  }

  /**
   * Feature 1: Изчислява колко максимално XP може да се изкара от курса
   * @returns {number} Общ брой потенциални точки
   */
  calculateMaxPotentialXP() {
    let totalLessons = 0;

    if (this.course.curriculum && Array.isArray(this.course.curriculum)) {
      this.course.curriculum.forEach(section => {
        if (section.lessons && Array.isArray(section.lessons)) {
          totalLessons += section.lessons.length;
        }
      });
    }

    return (totalLessons * this.XP_PER_LESSON) + this.COMPLETION_BONUS;
  }

  /**
   * Feature 2: Връща геймификационните категории (Skill Tree Paths)
   * @returns {Object} Обект с ID-та на главна и подкатегории
   */
  getSkillTreePaths() {
    return {
      mainTree: this.course.category || null,
      subTree: this.course.subcategories || null
    };
  }

  /**
   * Feature 3: Проверява дали потребителят се квалифицира за Pioneer значка
   * @returns {boolean}
   */
  isPioneerEligible() {
    const completedCount = this.course.successfullyCompletedByUsers 
      ? this.course.successfullyCompletedByUsers.length 
      : 0;
      
    return completedCount < this.PIONEER_THRESHOLD;
  }

  /**
   * Агрегира всички метаданни за курса, нужни на геймификационния енджин
   */
  getGamificationMetadata() {
    return {
      courseId: this.course._id || this.course.cid,
      maxXP: this.calculateMaxPotentialXP(),
      skillTrees: this.getSkillTreePaths(),
      offersPioneerBadge: this.isPioneerEligible()
    };
  }
}

export default GamifiedCourse;
