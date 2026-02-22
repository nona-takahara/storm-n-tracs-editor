import {
  Button,
  ButtonGroup,
  Checkbox,
  ControlGroup,
  Divider,
  Intent,
  MenuItem,
  Radio,
  RadioGroup,
  UL,
} from "@blueprintjs/core";
import { Code, Trash } from "@blueprintjs/icons";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import { ChangeEvent, useState } from "react";
import * as EditMode from "../../EditMode";
import Vector2d from "../../data/Vector2d";
import { useEditorCommands, useEditorSelector } from "../../store/EditorStore";
import EditLua from "./EditLua";

function EditArea() {
  const commands = useEditorCommands();
  const selectedArea = useEditorSelector((state) => state.selectedArea);
  const vertexes = useEditorSelector((state) => state.vertexes);
  const areas = useEditorSelector((state) => state.areas);
  const editMode = useEditorSelector((state) => state.editMode);

  const [showLuaDialog, setShowLuaDialog] = useState(false);
  const [showInnerCoordinate, setShowInnerCoordinate] = useState(false);
  const [upareaCandidate, setUpareaCandidate] = useState("");

  if (!selectedArea) {
    return null;
  }

  const area = areas.get(selectedArea);
  if (!area) {
    return null;
  }

  const canDeleteVertex = area.vertexes.length > 3;

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
    return item.includes(query);
  };

  return (
    <>
      {showLuaDialog && (
        <EditLua
          close={() => {
            setShowLuaDialog(false);
          }}
          updateLuaCode={(code) => {
            commands.updateSelectedAreaLua(code);
          }}
          luaCode={area.callback}
          selectedArea={selectedArea}
        />
      )}
      <ButtonGroup>
        <b>{selectedArea}</b>
        <Divider />
        {editMode === EditMode.EditArea && (
          <>
            <Button
              onClick={() => {
                setShowLuaDialog(true);
              }}
              icon={<Code />}
            >
              Lua
            </Button>
            <Button
              onClick={commands.deleteSelectedArea}
              icon={<Trash />}
              intent={Intent.DANGER}
            >
              DEL
            </Button>
          </>
        )}
        {editMode === EditMode.AddArea && "Add Area Mode"}
      </ButtonGroup>
      <Divider />
      <ButtonGroup>
        <Select<string>
          items={Array.from(areas.keys())}
          itemRenderer={itemRender}
          itemPredicate={filterItem}
          onItemSelect={(item) => {
            setUpareaCandidate(item);
          }}
          popoverProps={{ minimal: true }}
          noResults={
            <MenuItem
              disabled={true}
              text="No results."
              roleStructure="listoption"
            />
          }
        >
          <Button text={upareaCandidate} rightIcon="double-caret-vertical" />
        </Select>
        <Button
          onClick={() => {
            commands.addSelectedAreaUparea(upareaCandidate);
            setUpareaCandidate("");
          }}
        >
          Add UpArea
        </Button>
      </ButtonGroup>
      <UL>
        {area.uparea.map((linkedArea) => (
          <li key={`${selectedArea}*${linkedArea}`}>
            <ControlGroup>
              {linkedArea}
              <Divider />
              <ButtonGroup>
                <Button
                  onClick={() => {
                    commands.removeSelectedAreaUparea(linkedArea);
                    setUpareaCandidate("");
                  }}
                  icon={<Trash />}
                  intent={Intent.DANGER}
                />
              </ButtonGroup>
            </ControlGroup>
          </li>
        ))}
      </UL>
      <Divider />
      <Checkbox
        label="Show Inner Coordinate"
        checked={showInnerCoordinate}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setShowInnerCoordinate(event.target.checked);
        }}
      />
      <Divider />
      <RadioGroup
        selectedValue={area.vertexes[area.leftVertexInnerId]}
        onChange={(event) => {
          commands.setSelectedAreaLeftVertex(event.currentTarget.value);
        }}
      >
        {area.vertexes.map((vertexId, index) => {
          const vertex = vertexes.get(vertexId);
          const nextVertexId = area.vertexes[(index + 1) % area.vertexes.length];
          const nextVertex = vertexes.get(nextVertexId);
          const edgeLength =
            vertex &&
            nextVertex &&
            Math.sqrt(
              (vertex.x - nextVertex.x) * (vertex.x - nextVertex.x) +
                (vertex.z - nextVertex.z) * (vertex.z - nextVertex.z)
            );

          if (!vertex) {
            return undefined;
          }

          const shownVertex = showInnerCoordinate
            ? new Vector2d(
                ((vertex.x + 500) % 1000 + 1000) % 1000 - 500,
                ((vertex.z + 500) % 1000 + 1000) % 1000 - 500
              )
            : vertex;

          return (
            <Radio value={vertexId} key={vertexId}>
              {vertexId}({shownVertex.x.toFixed(1)}, {shownVertex.z.toFixed(1)})(
              {edgeLength?.toFixed(2)})
              <ButtonGroup>
                <Button
                  onClick={() => {
                    commands.insertVertexBetween(index);
                  }}
                  small={true}
                >
                  +
                </Button>
                <Button
                  onClick={
                    canDeleteVertex
                      ? () => {
                          commands.removeVertexFromSelectedArea(index);
                        }
                      : undefined
                  }
                  small={true}
                  disabled={!canDeleteVertex}
                >
                  -
                </Button>
              </ButtonGroup>
            </Radio>
          );
        })}
      </RadioGroup>
    </>
  );
}

export default EditArea;
