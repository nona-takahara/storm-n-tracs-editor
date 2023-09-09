import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import NtracsTrack from "../../data/NtracsTrack";

type EditTrackProps = {
  selectedArea: string | undefined;
  tracks: Map<string, NtracsTrack>;
  setSelectedTrack: React.Dispatch<React.SetStateAction<string | undefined>>;
};

function EditArea(props: EditTrackProps) {
  const itemRender: ItemRenderer<string> = (item, { handleClick, handleFocus, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={item}
        onClick={handleClick}
        onFocus={handleFocus}
        roleStructure="listoption"
        text={item}
      />
    );
  };

  const filterItem: ItemPredicate<string> = (query, film, _index, exactMatch) => {
    return true;
  }

  return (
    <>
      <div>
        <Select<string>
          createNewItemFromQuery={(str) => str}
          createNewItemRenderer={(
            query: string,
            active: boolean,
            handleClick: React.MouseEventHandler<HTMLElement>,
          ) => (
            <MenuItem
              icon="add"
              text={`Create "${query}"`}
              roleStructure="listoption"
              active={active}
              onClick={handleClick}
              shouldDismissPopover={false}
            />)}
          items={Array.from(props.tracks.keys())}
          itemRenderer={itemRender}
          itemPredicate={filterItem}
          onItemSelect={(item: string) => props.setSelectedTrack(item)}
          popoverProps={{ minimal: true }}
          
          fill={true}
          noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
        >
          <Button rightIcon="double-caret-vertical" />
        </Select>
      </div>
    </>
  );
}

export default EditArea;
