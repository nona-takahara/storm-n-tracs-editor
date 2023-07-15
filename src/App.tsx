import { useLayoutEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Nav from "./ui/Nav";
import { Stage, Container } from "@pixi/react";
import AreaPolygonsView from "./ui/AreaPolygonsView";

const useWindowSize = (): number[] => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = (): void => {
      setSize([window.innerWidth - 8, window.innerHeight -8]);
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};

function App() {
  const [view, setView] = useState("");
  const [width, height] = useWindowSize();

  return (
    <>
      <Nav></Nav>
      <Stage
        width={width}
        height={height}
        style={{margin: 'auto'}}>
          <Container position={[width / 2, height /2]}>
            <AreaPolygonsView />
          </Container>
        </Stage>
    </>
  );
}

export default App;
