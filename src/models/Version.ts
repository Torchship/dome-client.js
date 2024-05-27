export class Version {
  private major: number;
  private minor: number;
  private patch: number;

  constructor(major: number = 0, minor: number = 0, patch: number = 0) {
      this.major = major;
      this.minor = minor;
      this.patch = patch;
  }

  public incrementMajor(): void {
      this.major++;
      this.minor = 0;
      this.patch = 0;
  }

  public incrementMinor(): void {
      this.minor++;
      this.patch = 0;
  }

  public incrementPatch(): void {
      this.patch++;
  }

  public toString(): string {
      return `${this.major}.${this.minor}.${this.patch}`;
  }

  public static fromString(versionString: string): Version {
      const [major, minor, patch] = versionString.split('.').map(Number);
      return new Version(major, minor, patch);
  }

  public compareTo(other: Version): number {
      if (this.major !== other.major) {
          return this.major - other.major;
      }
      if (this.minor !== other.minor) {
          return this.minor - other.minor;
      }
      return this.patch - other.patch;
  }
}

export default Version;