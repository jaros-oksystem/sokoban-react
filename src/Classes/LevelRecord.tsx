export default class LevelRecord {
  uuid: string;
  order: number;
  levelName: string;
  csbCode: string;

  constructor(uuid: string, order: number, levelName: string, csbCode: string) {
    this.uuid = uuid;
    this.order = order;
    this.levelName = levelName;
    this.csbCode = csbCode;
  }

}