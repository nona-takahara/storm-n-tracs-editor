import {
  Button,
  ButtonGroup,
  ControlGroup,
  Divider,
  Intent,
  MenuItem,
  OL,
} from "@blueprintjs/core";
import { Add, Clean, Trash } from "@blueprintjs/icons";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import { useEditorCommands, useEditorSelector } from "../../store/EditorStore";

function EditTrack() {
  const commands = useEditorCommands();
  const selectedTrack = useEditorSelector((state) => state.selectedTrack);
  const tracks = useEditorSelector((state) => state.nttracks);

  const itemRender: ItemRenderer<string> = (
    item,
    { handleClick, handleFocus, modifiers }
  ) => {
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

  const filterItem: ItemPredicate<string> = (query, item) => {
    return item.startsWith(query);
  };

  const selectedTrackAreas = selectedTrack
    ? tracks.get(selectedTrack)?.areas ?? []
    : [];

  return (
    <div>
      <ControlGroup>
        <Select<string>
          createNewItemFromQuery={(query) => query}
          createNewItemRenderer={(
            query: string,
            active: boolean,
            handleClick: React.MouseEventHandler<HTMLElement>
          ) => (
            <MenuItem
              icon="add"
              text={`Create "${query}"`}
              roleStructure="listoption"
              active={active}
              onClick={(event) => {
                commands.createTrack(query);
                handleClick(event);
              }}
              shouldDismissPopover={false}
            />
          )}
          items={Array.from(tracks.keys())}
          itemRenderer={itemRender}
          itemPredicate={filterItem}
          onItemSelect={(item) => {
            commands.setSelectedTrack(item);
          }}
          popoverProps={{ minimal: true }}
          noResults={
            <MenuItem disabled={true} text="No results." roleStructure="listoption" />
          }
        >
          <Button text={selectedTrack} rightIcon="double-caret-vertical" />
        </Select>
        <Divider />
        {selectedTrack && (
          <ButtonGroup>
            <Button
              onClick={commands.deleteSelectedTrack}
              icon={<Trash />}
              intent={Intent.DANGER}
            >
              DEL
            </Button>
          </ButtonGroup>
        )}
      </ControlGroup>
      <Divider />
      {selectedTrack && (
        <ButtonGroup>
          <Button onClick={commands.addSelectedAreaToTrack} icon={<Add />}>
            Add
          </Button>
          <Button
            onClick={commands.clearSelectedTrack}
            icon={<Clean />}
            intent={Intent.WARNING}
          >
            Clear
          </Button>
        </ButtonGroup>
      )}
      <OL>
        {selectedTrackAreas.map((entry, index) => (
          <li key={`${entry.areaName}-${index}`}>
            <ControlGroup>
              <b>{entry.areaName}</b>
              <Divider />
              <ButtonGroup>
                <Button
                  onClick={() => {
                    commands.cycleTrackFlag(index);
                  }}
                >
                  {entry.trackFlag}
                </Button>
                <Button
                  onClick={() => {
                    commands.removeTrackArea(index);
                  }}
                  icon={<Trash />}
                  intent={Intent.DANGER}
                />
              </ButtonGroup>
            </ControlGroup>
          </li>
        ))}
      </OL>
    </div>
  );
}

export default EditTrack;
