// Този клас разширява функционалността на затворения модел Certificate

class GamifiedCertificate {
  /**
   * @param {Object} certificateDoc - Инстанция на оригиналния Mongoose модел Certificate
   */
  constructor(certificateDoc) {
    // Композиция: запазваме референция към оригиналния документ, без да го променяме
    this.certificate = certificateDoc; 
  }

  /**
   * Feature 1 & 3: Изчисляване на XP и Значки на база на резултата (score)
   * Връща обект с наградите, които трябва да се добавят към профила на потребителя.
   */
  calculateRewards() {
    let xpAwarded = 0;
    const badgesEarned = [];
    const score = this.certificate.score;

    // Базово XP за самото завършване и издаване на сертификат
    xpAwarded += 500;

    // Бонус XP и Значки на база на резултата (score е между 0 и 100 според схемата)
    if (score >= 95) {
      xpAwarded += 300;
      badgesEarned.push({ name: 'Perfect Execution', tier: 'Gold' });
    } else if (score >= 80) {
      xpAwarded += 150;
      badgesEarned.push({ name: 'High Achiever', tier: 'Silver' });
    } else if (score >= 60) {
      xpAwarded += 50;
      badgesEarned.push({ name: 'Course Finisher', tier: 'Bronze' });
    }

    return {
      userId: this.certificate.user,
      courseInstanceId: this.certificate.courseInstance,
      xpAwarded,
      badgesEarned
    };
  }

  /**
   * Helper метод, ако ни трябва бърз достъп до ID-то на сертификата
   */
  getCertificateId() {
    return this.certificate.certificateId;
  }
}

module.exports = GamifiedCertificate;
