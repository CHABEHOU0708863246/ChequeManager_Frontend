export class NumberToWordsUtil {
  private static readonly units = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
    'dix-sept', 'dix-huit', 'dix-neuf'
  ];

  private static readonly tens = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
  ];

  /**
   * Convertit un nombre en lettres (français)
   * @param amount Montant en chiffres
   * @returns Montant en lettres en majuscules
   */
  static convertToWords(amount: number): string {
    if (amount === 0) return 'ZÉRO FRANCS CFA';
    if (amount < 0) return 'MONTANT NÉGATIF INVALIDE';
    if (amount > 999999999999) return 'MONTANT TROP ÉLEVÉ';

    const result = this.convertNumberToWords(Math.floor(amount));
    return `${result} FRANCS CFA`.toUpperCase();
  }

  private static convertNumberToWords(num: number): string {
    if (num === 0) return '';
    if (num < 20) return this.units[num];
    if (num < 100) return this.convertTens(num);
    if (num < 1000) return this.convertHundreds(num);
    if (num < 1000000) return this.convertThousands(num);
    if (num < 1000000000) return this.convertMillions(num);
    return this.convertBillions(num);
  }

  private static convertTens(num: number): string {
    if (num < 20) return this.units[num];

    const unit = num % 10;
    const ten = Math.floor(num / 10);

    if (ten === 7 || ten === 9) {
      // 70-79 = soixante-dix, soixante-onze, etc.
      // 90-99 = quatre-vingt-dix, quatre-vingt-onze, etc.
      const baseNumber = (ten === 7 ? 60 : 80);
      const remainder = num - baseNumber;
      return this.tens[ten] + (remainder > 0 ? '-' + this.units[remainder] : '');
    }

    if (ten === 8 && unit === 0) {
      return 'quatre-vingts'; // Avec 's' si exactement 80
    }

    if (unit === 0) {
      return this.tens[ten];
    }

    if (unit === 1 && ten !== 8) {
      return this.tens[ten] + '-et-un';
    }

    return this.tens[ten] + '-' + this.units[unit];
  }

  private static convertHundreds(num: number): string {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;

    let result = '';

    if (hundreds === 1) {
      result = 'cent';
    } else {
      result = this.units[hundreds] + ' cent';
    }

    // Ajouter 's' à cent si multiple de 100 exact
    if (remainder === 0 && hundreds > 1) {
      result += 's';
    }

    if (remainder > 0) {
      result += ' ' + this.convertNumberToWords(remainder);
    }

    return result;
  }

  private static convertThousands(num: number): string {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;

    let result = '';

    if (thousands === 1) {
      result = 'mille';
    } else {
      result = this.convertNumberToWords(thousands) + ' mille';
    }

    if (remainder > 0) {
      result += ' ' + this.convertNumberToWords(remainder);
    }

    return result;
  }

  private static convertMillions(num: number): string {
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;

    let result = '';

    if (millions === 1) {
      result = 'un million';
    } else {
      result = this.convertNumberToWords(millions) + ' millions';
    }

    if (remainder > 0) {
      result += ' ' + this.convertNumberToWords(remainder);
    }

    return result;
  }

  private static convertBillions(num: number): string {
    const billions = Math.floor(num / 1000000000);
    const remainder = num % 1000000000;

    let result = '';

    if (billions === 1) {
      result = 'un milliard';
    } else {
      result = this.convertNumberToWords(billions) + ' milliards';
    }

    if (remainder > 0) {
      result += ' ' + this.convertNumberToWords(remainder);
    }

    return result;
  }

  /**
   * Valide si un montant est acceptable
   */
  static isValidAmount(amount: number): boolean {
    return amount > 0 && amount <= 999999999999;
  }

  /**
   * Formate un montant avec espaces pour milliers
   */
  static formatNumber(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }
}
