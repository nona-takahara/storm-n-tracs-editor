import { Button, ControlGroup, Divider, MenuItem, OL } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import NtracsTrack from "../../data/NtracsTrack";
import { Updater } from "use-immer";

type EditTrackProps = {
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
  tracks: Map<string, NtracsTrack>;
  updateTracks: Updater<Map<string, NtracsTrack>>;
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
        <ControlGroup>
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
              onClick={(e) => {
                props.updateTracks((draft) => {
                  if (!draft.get(query)) {
                    draft.set(query, new NtracsTrack([]));
                  }
                })
                handleClick(e)
              }}
              shouldDismissPopover={false}
            />)}
          items={Array.from(props.tracks.keys())}
          itemRenderer={itemRender}
          itemPredicate={filterItem}
          onItemSelect={(item: string) => props.setSelectedTrack(item)}
          popoverProps={{ minimal: true }}
          noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
        >
          <Button text={props.selectedTrack} rightIcon="double-caret-vertical" />
        </Select>
        <Divider />
        </ControlGroup>
        <OL>
          {props.selectedTrack && props.tracks.get(props.selectedTrack)?.areas.map(v => {
            return (
              <li><b>{v.areaName}</b> {v.trackFlag}</li>
            )
          })}
        </OL>
      </div>
    </>
  );
}

export default EditArea;
