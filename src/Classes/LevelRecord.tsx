export default class LevelRecord {
  uuid: string;
  order: number;
  levelName: string;
  csbCode: string;

  constructor(order: number, levelName: string, csbCode: string) {
    this.uuid = crypto.randomUUID();
    this.order = order;
    this.levelName = levelName;
    this.csbCode = csbCode;
  }
}