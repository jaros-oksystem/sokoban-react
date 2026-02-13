import LevelRecord from "@/src/Classes/LevelRecord";

export default class LevelCollection {
  uuid: string;
  collectionName: string;
  author: string;
  description: string;
  levels: LevelRecord[];

  constructor(collectionName: string, author: string, description: string, levels: LevelRecord[]) {
    this.uuid = crypto.randomUUID();
    this.collectionName = collectionName;
    this.author = author;
    this.description = description;
    this.levels = levels;
  }
}