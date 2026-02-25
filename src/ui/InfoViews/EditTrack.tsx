import {
  Button,
  ButtonGroup,
  ControlGroup,
  Divider,
  Intent,
  MenuItem,
  OL,
  Switch,
} from "@blueprintjs/core";
import { Clean, Trash } from "@blueprintjs/icons";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import {
  ChangeEvent,
  MouseEventHandler,
} from "react";
import { useEditorCommands, useEditorSelector } from "../../store/EditorStore";

function EditTrack() {
  const commands = useEditorCommands();
  const selectedTrack = useEditorSelector((state) => state.selectedTrack);
  const tracks = useEditorSelector((state) => state.nttracks);
  const trackChainSelectEnabled = useEditorSelector(
    (state) => state.trackChainSelectEnabled
  );

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

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedTrackAreas.length) {
      return;
    }
    commands.moveTrackArea(fromIndex, toIndex);
  };

  return (
    <div>
      <ControlGroup>
        <Select<string>
          createNewItemFromQuery={(query) => query}
          createNewItemRenderer={(
            query: string,
            active: boolean,
            handleClick: MouseEventHandler<HTMLElement>
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
      <Switch
        checked={trackChainSelectEnabled}
        disabled={!selectedTrack}
        label="Area Chain Select"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          commands.setTrackChainSelectEnabled(event.target.checked);
        }}
      />
      <div style={{ fontSize: "12px", marginTop: "4px", marginBottom: "8px", opacity: 0.8 }}>
        {selectedTrack
          ? trackChainSelectEnabled
            ? "Chain Select ON: click an area on stage to append it."
            : "Chain Select OFF: stage click only selects an area."
          : "Select or create a track to enable chain selection."}
      </div>
      {selectedTrack && (
        <ButtonGroup>
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
                      moveRow(index, index - 1);
                    }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    Up
                  </Button>
                  <Button
                    onClick={() => {
                      moveRow(index, index + 1);
                    }}
                    disabled={index === selectedTrackAreas.length - 1}
                    title="Move down"
                  >
                    Down
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
