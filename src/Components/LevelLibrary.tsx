import LevelCollection from "@/src/Classes/LevelCollection";
import React, {useEffect, useState} from "react";

import CollectionDialogueButton from "@/src/Components/DialogueBox/Library/CollectionDialogueButton";
import CollectionCard from "@/src/Components/LibraryCards/CollectionCard";
import {
  addCollectionToLibrary,
  getLibraryFromLocalStorage,
  removeCollectionFromLibrary
} from "@/src/Util/LocalStorage/LibraryStorageUtils";
import ImportCollectionButton from "@/src/Components/DialogueBox/Library/ImportCollectionButton";

export default function LevelLibrary() {
  const [library, setLibrary] = useState<LevelCollection[]>(getLibraryFromLocalStorage());

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
  }, []);

  function handleCollectionDelete(collectionUuid: string) {
    const newLibrary = removeCollectionFromLibrary(collectionUuid);
    setLibrary(newLibrary);
  }

  function handleNewCollectionCreate(newCollection: LevelCollection) {
    if (getLibraryFromLocalStorage().some(c => c.uuid == newCollection.uuid)) {
      console.log(newCollection.uuid);
      alert("Collection already exists");
      return;
    }
    const newLibrary = addCollectionToLibrary(newCollection);
    setLibrary(newLibrary);
  }

  return (
      loaded &&
      <div>
        <div className="flex border-black border-2 w-96 p-2 mx-auto rounded-[10] bg-gray-100">
          <CollectionDialogueButton onSave={handleNewCollectionCreate} />
          <div className="mx-1"></div>
          <ImportCollectionButton onImport={handleNewCollectionCreate}/>
        </div>
        {
          library.map((collection: LevelCollection) =>
              <CollectionCard key={collection.uuid} defaultCollection={collection} onDelete={handleCollectionDelete} />
          )
        }
      </div>
  );
}