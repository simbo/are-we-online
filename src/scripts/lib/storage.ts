const STORAGE_DATA_VERSION = 1;

enum StorageKey {
  Data = 'awoData',
  DataVersion = 'awoDataVersion'
}

interface StorageData {
  hostnames: string[];
  pingInterval: number;
}

class Storage {
  private readonly version = STORAGE_DATA_VERSION;
  private readonly defaultData = JSON.stringify({});

  private data!: StorageData;

  constructor() {
    this.verifyDataVersion();
    this.read();
  }

  public set(data: Partial<StorageData>): void {
    this.data = { ...this.data, ...data };
    this.write();
  }

  public get(fallback: StorageData): StorageData {
    return { ...fallback, ...this.data };
  }

  private read(): void {
    this.data = JSON.parse(localStorage.getItem(StorageKey.Data) || JSON.stringify(this.defaultData));
  }

  private write(): void {
    localStorage.setItem(StorageKey.Data, JSON.stringify(this.data));
  }

  private clear(): void {
    localStorage.removeItem(StorageKey.Data);
    localStorage.removeItem(StorageKey.DataVersion);
  }

  private verifyDataVersion(): void {
    const version = JSON.parse(localStorage.getItem(StorageKey.DataVersion) || JSON.stringify(this.version));
    if (version !== this.version) {
      this.clear();
    }
    localStorage.setItem(StorageKey.DataVersion, JSON.stringify(this.version));
  }
}

export const storage = new Storage();
