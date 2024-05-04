import { Button, ButtonGroup, ControlGroup, Divider, MenuItem, OL, Intent } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import NtracsTrack, { AreaCollection, TrackFlag } from "../../data/NtracsTrack";
import { Updater } from "use-immer";
import { Clean, Trash, Add } from "@blueprintjs/icons";

interface EditTrackProps {
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
  tracks: Map<string, NtracsTrack>;
  updateTracks: Updater<Map<string, NtracsTrack>>;
  setSelectedTrack: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function EditArea(props: EditTrackProps) {
  const itemRender: ItemRenderer<string> = (item, { handleClick, handleFocus, modifiers }) => {
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

  const filterItem: ItemPredicate<string> = (query, film) => {
    return film.startsWith(query);
  }

  const delTrackButton = () => {
    props.updateTracks(draft => {
      if (props.selectedTrack) {
        draft.delete(props.selectedTrack);
        props.setSelectedTrack(undefined);
      }
    })
  }

  const addButton = () => {
    props.updateTracks(draft => {
      if (props.selectedTrack) {
        const areas = draft.get(props.selectedTrack)?.areas;
        if (areas && props.selectedArea) {
          if (areas.map(v => v.areaName).findIndex(v => v == props.selectedArea) === -1) {
            draft.set(props.selectedTrack, new NtracsTrack(areas.slice().concat(new AreaCollection(props.selectedArea, TrackFlag.none))));
          }
        }
      }
    });
  };

  const claerButton = () => {
    props.updateTracks(draft => {
      if (props.selectedTrack) {
        draft.set(props.selectedTrack, new NtracsTrack([]));
      }
    });
  }

  const changeTrackFlag = (index: number) => () => {
    props.updateTracks(draft => {
      if (props.selectedTrack) {
        const old = draft.get(props.selectedTrack);
        if (old?.areas) {
          draft.set(props.selectedTrack, new NtracsTrack(old.areas.map((v, i) => {
            if (index === i) {
              let next = TrackFlag.none;
              if (v.trackFlag == TrackFlag.none) next = TrackFlag.upbound;
              if (v.trackFlag == TrackFlag.upbound) next = TrackFlag.downbound;
              return new AreaCollection(v.areaName, next);
            } else {
              return v;
            }
          })));
        }
      }
    })
  }

  const rmArea = (index: number) => () => {
    props.updateTracks(draft => {
      if (props.selectedTrack) {
        const old = draft.get(props.selectedTrack);
        if (old) {
          draft.set(props.selectedTrack, new NtracsTrack(old.areas.filter((v, i) => i !== index)));
        }
      }
    })
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
            onItemSelect={(item: string) => { props.setSelectedTrack(item); }}
            popoverProps={{ minimal: true }}
            noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
          >
            <Button text={props.selectedTrack} rightIcon="double-caret-vertical" />
          </Select>
          <Divider />
          {props.selectedTrack && <ButtonGroup>
            <Button onClick={delTrackButton} icon={<Trash />} intent={Intent.DANGER}>DEL</Button>
          </ButtonGroup>}
        </ControlGroup>
        <Divider />
        {props.selectedTrack && <ButtonGroup>
          <Button onClick={addButton} icon={<Add />}>Add</Button>
          <Button onClick={claerButton} icon={<Clean />} intent={Intent.WARNING}>Clear</Button>
        </ButtonGroup>}
        <OL>
          {props.selectedTrack && props.tracks.get(props.selectedTrack)?.areas.map((v, i) => {
            return (
              <li key={i}><ControlGroup><b>{v.areaName}</b>
                <Divider />
                <ButtonGroup>
                  <Button onClick={changeTrackFlag(i)}>{v.trackFlag}</Button>
                  <Button onClick={rmArea(i)} icon={<Trash />} intent={Intent.DANGER}></Button>
                </ButtonGroup></ControlGroup></li>
            )
          })}
        </OL>
      </div>
    </>
  );
}

export default EditArea;
