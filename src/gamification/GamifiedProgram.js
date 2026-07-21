// Разширява затворения модел Program за нуждите на геймификацията

class GamifiedProgram {
  /**
   * @param {Object} programDoc - Mongoose документ от модела Program
   */
  constructor(programDoc) {
    this.program = programDoc;
    
    // Базови настройки
    this.BASE_PROGRAM_COMPLETION_XP = 2000;
    this.MILESTONE_XP_REWARD = 250;
  }

  /**
   * Връща множител на база трудността на програмата
   * @returns {number}
   */
  getDifficultyMultiplier() {
    switch (this.program.difficulty) {
      case 'advanced':
        return 2.5;
      case 'intermediate':
        return 1.5;
      case 'beginner':
      default:
        return 1.0;
    }
  }

  /**
   * Feature 1 & 3: Изчислява финалните награди при завършване на програма
   * @param {string} userId
   * @param {Array} userCompletedCourses - Масив с ID-та на завършените от потребителя курсове
   * @returns {Object|null} Обект с наградите или null, ако не е завършена
   */
  getCompletionRewards(userId, userCompletedCourses) {
    // Използваме вградения метод от оригиналния модел
    if (!this.program.isCompletedByUser(userId, userCompletedCourses)) {
      return null; 
    }

    const multiplier = this.getDifficultyMultiplier();
    const totalXP = Math.round(this.BASE_PROGRAM_COMPLETION_XP * multiplier);

    // Взимаме първия career path за Титла (ако има такъв)
    let grantedTitle = null;
    if (this.program.careerPaths && this.program.careerPaths.length > 0) {
      grantedTitle = `Master of ${this.program.careerPaths[0]}`;
    }

    return {
      totalXP,
      grantedTitle,
      badge: 'Program Graduate',
      programId: this.program._id || this.program.cid
    };
  }

  /**
   * Feature 2: Проверява дали потребителят е преминал определен Milestone
   * Този метод се вика всеки път, когато потребител завърши курс от програмата.
   * @param {Array} userCompletedCourses 
   * @param {Array} userClaimedMilestones - Кои проценти (25, 50, 75) вече е взел (пазят се в User профила)
   * @returns {Array} Списък с нови награди за отключени Milestones
   */
  checkMilestoneRewards(userCompletedCourses, userClaimedMilestones = []) {
    const newRewards = [];
    // Използваме вградения метод от схемата
    const progressPercent = this.program.calculateProgress(userCompletedCourses);
    
    const thresholds = [25, 50, 75];

    thresholds.forEach(threshold => {
      // Ако е минал прага и не си е взел наградата досега
      if (progressPercent >= threshold && !userClaimedMilestones.includes(threshold)) {
        newRewards.push({
          milestone: threshold,
          xp: this.MILESTONE_XP_REWARD,
          message: `Keep going! You've completed ${threshold}% of the ${this.program.name} program!`
        });
      }
    });

    return newRewards;
  }
}

export default GamifiedProgram;
