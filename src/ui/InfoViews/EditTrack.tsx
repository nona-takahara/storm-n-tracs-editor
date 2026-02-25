import {
  Alert,
  Button,
  ButtonGroup,
  ControlGroup,
  Divider,
  InputGroup,
  Intent,
  Switch,
} from "@blueprintjs/core";
import { Clean, Trash } from "@blueprintjs/icons";
import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorCommands, useEditorSelector } from "../../store/EditorStore";

interface SortableAreaRowProps {
  id: string;
  areaName: string;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onPreview: (areaId: string | undefined) => void;
}

function SortableAreaRow(props: SortableAreaRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.id });

  return (
    <li
      ref={setNodeRef}
      onMouseEnter={() => {
        props.onPreview(props.areaName);
      }}
      onMouseLeave={() => {
        props.onPreview(undefined);
      }}
      style={{
        listStyleType: "none",
        marginBottom: "6px",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: "4px",
        background: "rgba(255,255,255,0.65)",
        padding: "6px",
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Button
          minimal={true}
          icon="drag-handle-vertical"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        />
        <b
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {props.areaName}
        </b>
        <ButtonGroup>
          <Button
            small={true}
            onClick={() => {
              props.onMove(props.index, props.index - 1);
            }}
            disabled={props.index === 0}
            title="Move up"
          >
            Up
          </Button>
          <Button
            small={true}
            onClick={() => {
              props.onMove(props.index, props.index + 1);
            }}
            disabled={props.index === props.total - 1}
            title="Move down"
          >
            Down
          </Button>
          <Button
            small={true}
            onClick={() => {
              props.onRemove(props.index);
            }}
            icon={<Trash />}
            intent={Intent.DANGER}
            title="Remove this area from track"
          />
        </ButtonGroup>
      </div>
    </li>
  );
}

const trackNameCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function EditTrack() {
  const commands = useEditorCommands();
  const selectedTrack = useEditorSelector((state) => state.selectedTrack);
  const tracks = useEditorSelector((state) => state.nttracks);
  const trackChainSelectEnabled = useEditorSelector(
    (state) => state.trackChainSelectEnabled
  );
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [newTrackId, setNewTrackId] = useState("");
  const [trackBrowserOpen, setTrackBrowserOpen] = useState(
    selectedTrack === undefined
  );
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const selectedTrackAreas = selectedTrack
    ? tracks.get(selectedTrack)?.areas ?? []
    : [];

  const sortedTrackIds = useMemo(
    () => Array.from(tracks.keys()).sort((a, b) => trackNameCollator.compare(a, b)),
    [tracks]
  );

  const filteredTrackIds = useMemo(() => {
    const query = trackSearchQuery.trim().toLowerCase();
    if (!query) {
      return sortedTrackIds;
    }
    return sortedTrackIds.filter((trackId) =>
      trackId.toLowerCase().includes(query)
    );
  }, [sortedTrackIds, trackSearchQuery]);

  const sortableIds = useMemo(
    () =>
      selectedTrackAreas.map(
        (entry, index) => `${index}:${entry.areaName}`
      ),
    [selectedTrackAreas]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedTrackAreas.length) {
      return;
    }
    commands.moveTrackArea(fromIndex, toIndex);
  };

  const createTrackFromInput = () => {
    const trackId = newTrackId.trim();
    if (!trackId) {
      return;
    }
    commands.createTrack(trackId);
    commands.setPreviewTrack(undefined);
    setNewTrackId("");
    setTrackSearchQuery("");
    setTrackBrowserOpen(false);
  };

  const onCreateTrackKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      createTrackFromInput();
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = sortableIds.findIndex((id) => id === String(active.id));
    const toIndex = sortableIds.findIndex((id) => id === String(over.id));
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    commands.moveTrackArea(fromIndex, toIndex);
  };

  useEffect(() => {
    if (!selectedTrack) {
      commands.setPreviewArea(undefined);
      commands.setPreviewTrack(undefined);
    }
  }, [commands, selectedTrack]);

  useEffect(() => {
    return () => {
      commands.setPreviewArea(undefined);
      commands.setPreviewTrack(undefined);
    };
  }, [commands]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <Button
            small={true}
            icon={trackBrowserOpen ? "chevron-up" : "chevron-down"}
            onClick={() => {
              if (trackBrowserOpen) {
                commands.setPreviewTrack(undefined);
              }
              setTrackBrowserOpen((open) => !open);
            }}
          >
            {trackBrowserOpen ? "Hide Tracks" : "Browse Tracks"}
          </Button>
          <div
            style={{
              fontSize: "12px",
              opacity: 0.8,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
            title={selectedTrack ?? "None"}
          >
            Current Track: <b>{selectedTrack ?? "None"}</b>
          </div>
        </div>
        <InputGroup
          value={trackSearchQuery}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setTrackSearchQuery(event.target.value);
          }}
          placeholder="Filter tracks"
          leftIcon="search"
          small={true}
          style={{ marginBottom: "6px" }}
        />
        <ControlGroup fill={true}>
          <InputGroup
            value={newTrackId}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNewTrackId(event.target.value);
            }}
            onKeyDown={onCreateTrackKeyDown}
            placeholder="Create or select track ID"
            leftIcon="add"
            small={true}
          />
          <Button
            small={true}
            icon="add"
            onClick={createTrackFromInput}
            disabled={!newTrackId.trim()}
          >
            Create / Select
          </Button>
        </ControlGroup>
      </div>

      {trackBrowserOpen && (
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: "4px",
            padding: "6px",
            maxHeight: "160px",
            overflowY: "auto",
            marginBottom: "8px",
          }}
        >
          {filteredTrackIds.length === 0 ? (
            <div style={{ fontSize: "12px", opacity: 0.7 }}>No tracks found.</div>
          ) : (
            <ul style={{ margin: 0, padding: 0 }}>
              {filteredTrackIds.map((trackId) => {
                const areaCount = tracks.get(trackId)?.areas.length ?? 0;
                const isSelected = trackId === selectedTrack;
                return (
                  <li key={trackId} style={{ listStyleType: "none", marginBottom: "4px" }}>
                    <Button
                      fill={true}
                      small={true}
                      alignText="left"
                      intent={isSelected ? Intent.PRIMARY : undefined}
                      minimal={!isSelected}
                      onMouseEnter={() => {
                        commands.setPreviewArea(undefined);
                        commands.setPreviewTrack(trackId);
                      }}
                      onMouseLeave={() => {
                        commands.setPreviewTrack(undefined);
                      }}
                      onFocus={() => {
                        commands.setPreviewArea(undefined);
                        commands.setPreviewTrack(trackId);
                      }}
                      onBlur={() => {
                        commands.setPreviewTrack(undefined);
                      }}
                      onClick={() => {
                        commands.setSelectedTrack(trackId);
                        commands.setPreviewTrack(undefined);
                        setTrackBrowserOpen(false);
                      }}
                      text={`${trackId} (${areaCount})`}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

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
        <ButtonGroup style={{ marginBottom: "8px" }}>
          <Button
            onClick={() => {
              setDeleteAlertOpen(true);
            }}
            icon={<Trash />}
            intent={Intent.DANGER}
          >
            Delete Track
          </Button>
          <Button
            onClick={commands.clearSelectedTrack}
            icon={<Clean />}
            intent={Intent.WARNING}
          >
            Clear Areas
          </Button>
        </ButtonGroup>
      )}

      <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>
        {selectedTrack ? `Areas in track: ${selectedTrackAreas.length}` : "No track selected."}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {!selectedTrack && (
          <div style={{ fontSize: "12px", opacity: 0.7 }}>
            Select a track to edit area sequence.
          </div>
        )}

        {selectedTrack && selectedTrackAreas.length === 0 && (
          <div style={{ fontSize: "12px", opacity: 0.7 }}>
            No areas yet. Turn on Chain Select and click areas on stage.
          </div>
        )}

        {selectedTrack && selectedTrackAreas.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <ul style={{ margin: 0, padding: 0 }}>
                {selectedTrackAreas.map((entry, index) => (
                  <SortableAreaRow
                    key={sortableIds[index]}
                    id={sortableIds[index]}
                    areaName={entry.areaName}
                    index={index}
                    total={selectedTrackAreas.length}
                    onMove={moveRow}
                    onRemove={(targetIndex) => {
                      commands.removeTrackArea(targetIndex);
                    }}
                    onPreview={(areaId) => {
                      commands.setPreviewArea(areaId);
                    }}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        icon={<Trash />}
        intent={Intent.DANGER}
        isOpen={deleteAlertOpen}
        onCancel={() => {
          setDeleteAlertOpen(false);
        }}
        onClose={() => {
          setDeleteAlertOpen(false);
        }}
        onConfirm={() => {
          commands.deleteSelectedTrack();
          commands.setPreviewTrack(undefined);
          setDeleteAlertOpen(false);
        }}
      >
        <p>Delete the selected track?</p>
      </Alert>
    </div>
  );
}

export default EditTrack;
