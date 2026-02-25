import {
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  InputGroup,
  Intent,
  Radio,
  RadioGroup,
  UL,
} from "@blueprintjs/core";
import { Code, Trash } from "@blueprintjs/icons";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
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
  const [upareaQuery, setUpareaQuery] = useState("");
  const area = selectedArea ? areas.get(selectedArea) : undefined;
  const sharedVertexCandidates = useMemo(() => {
    if (!selectedArea || !area) {
      return [];
    }

    const selectedVertexes = new Set(area.vertexes);
    const candidates = new Set<string>();

    areas.forEach((otherArea, areaId) => {
      if (areaId === selectedArea) {
        return;
      }

      if (otherArea.vertexes.some((vertexId) => selectedVertexes.has(vertexId))) {
        candidates.add(areaId);
      }
    });

    area.uparea.forEach((areaId) => {
      if (areaId !== selectedArea) {
        candidates.add(areaId);
      }
    });

    return Array.from(candidates).sort((left, right) => left.localeCompare(right));
  }, [area?.uparea, area?.vertexes, areas, selectedArea]);

  const filteredCandidates = useMemo(() => {
    const query = upareaQuery.trim().toLowerCase();
    if (!query) {
      return sharedVertexCandidates;
    }
    return sharedVertexCandidates.filter((candidate) =>
      candidate.toLowerCase().includes(query)
    );
  }, [sharedVertexCandidates, upareaQuery]);

  useEffect(() => {
    commands.setPreviewArea(undefined);
    return () => {
      commands.setPreviewArea(undefined);
    };
  }, [commands, selectedArea]);

  if (!selectedArea || !area) {
    return null;
  }

  const canDeleteVertex = area.vertexes.length > 3;

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
      <InputGroup
        value={upareaQuery}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setUpareaQuery(event.target.value);
        }}
        placeholder="Search UpArea candidates"
        leftIcon="search"
      />
      <div style={{ fontSize: "12px", marginTop: "6px", marginBottom: "6px" }}>
        Candidates: shared vertex areas + current UpArea links
      </div>
      <UL style={{ maxHeight: "180px", overflowY: "auto", marginTop: 0 }}>
        {filteredCandidates.map((candidate) => {
          const isChecked = area.uparea.includes(candidate);
          const previewArea = areas.has(candidate) ? candidate : undefined;
          return (
            <li
              key={`${selectedArea}-uparea-${candidate}`}
              onMouseEnter={() => {
                commands.setPreviewArea(previewArea);
              }}
              onMouseLeave={() => {
                commands.setPreviewArea(undefined);
              }}
              style={{ listStyleType: "none", marginBottom: "2px" }}
            >
              <Checkbox
                checked={isChecked}
                label={candidate}
                onFocus={() => {
                  commands.setPreviewArea(previewArea);
                }}
                onBlur={() => {
                  commands.setPreviewArea(undefined);
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  if (event.target.checked) {
                    commands.addSelectedAreaUparea(candidate);
                  } else {
                    commands.removeSelectedAreaUparea(candidate);
                  }
                }}
              />
            </li>
          );
        })}
      </UL>
      {filteredCandidates.length === 0 && (
        <div style={{ fontSize: "12px", opacity: 0.7 }}>No candidates.</div>
      )}
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
