import { useEffect, useLayoutEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Nav from "./ui/Nav";
import { Stage, Container } from "@pixi/react";
import AreaPolygonsView from "./ui/AreaPolygonsView";
import Project from "./data/Project";

const useWindowSize = (): number[] => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = (): void => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};

function App() {
  const [width, height] = useWindowSize();
  const [leftPos, setLeftPos] = useState(-1500);
  const [topPos, setTopPos] = useState(-3000);
  const [scale, setScale] = useState(1);
  const [project, setProject] = useState<Project | undefined>(undefined);

  if (project == undefined) {
    setProject(Project.createTestData())
  }

  const wheelEvent = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.ctrlKey) {
      if (e.deltaY > 0) {
        setScale(Math.max(0.25, scale - 0.25));
      } else {
        setScale(Math.min(10, scale + 0.25));
      }
    } else if (e.shiftKey) {
      setLeftPos(leftPos - Math.floor(e.deltaY / scale));
    } else {
      setTopPos(topPos - Math.floor(e.deltaY / scale));
      setLeftPos(leftPos - Math.floor(e.deltaX / scale));
    }
  };

  return (
    <>
      <Nav></Nav>
      <div><br/>{leftPos},{topPos},{scale}</div>
      <Stage
        width={width}
        height={height}
        options={{
          antialias: true,
          background: 0xe0e0e0
        }}
        style={{margin: 0}}
        onWheel={wheelEvent}
        >
        <Container
          position={[
            leftPos*scale+width/2,
            topPos*scale+height/2]}
          scale={scale}
          >
          <AreaPolygonsView project={project} />
        </Container>
      </Stage>
    </>
  );
}

export default App;
