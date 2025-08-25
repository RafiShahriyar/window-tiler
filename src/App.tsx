import React from 'react'
import { useState, useEffect, useRef } from 'react'





const App = () => {
  

  type Box = {
    id: number;
    x: number;
    y: number;
    x_start: { left: number; right: number };
    y_start: { top: number; bottom: number };
    snapped: {left: boolean, right: boolean};
    color: {head: string, body:string}

  };

  const SNAP_THRESHOLD = 30;
  const windowWidth = window.innerWidth
  const[ windowOpen, setWindowOpen] = useState<boolean>(false);
  const isDragging = useRef<boolean>(false);
  const mouseStartPos = useRef({x:0 , y:0 });
  // const boxStartPos = useRef({x:0 , y:0 });
  // const [boxPos, setBoxPos] = useState({x:0,y:0});
  const [box, setBox] = useState<Box[]>([]);
  const activeBoxId = useRef<number|null>(null);
  // const shouldSnapLeft = useRef<boolean>(false);
  const showLeftPreview = useRef<boolean>(false);
  const showRightPreview = useRef<boolean>(false);

  function getRandomHSL(): string {
    const h = Math.floor(Math.random() * 360);   // Hue
    const s = 70 + Math.random() * 30;           // Saturation (70–100%)
    const l = 50 + Math.random() * 10;           // Lightness (50–60%)
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

const handleMouseDown = (e:React.MouseEvent<HTMLDivElement>, box: Box) =>{
 
  isDragging.current = true;
  activeBoxId.current = box.id;
  console.log(isDragging.current)
  mouseStartPos.current.x = e.clientX;
  mouseStartPos.current.y = e.clientY;
  console.log("MouseStartPos",mouseStartPos.current)

  const rect = e.currentTarget.getBoundingClientRect();
  // boxStartPos.current.x = rect.left;
  // boxStartPos.current.y = rect.top;
  
  setBox((prev)=>
    prev.map((b)=>(
      b.id === box.id
        ? { ...b, x_start: {left:rect.left,right:rect.right}, y_start: {top:rect.top,bottom:rect.bottom} }
        : b
    ))

  );
  console.log(box)


  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp)
}

const handleMouseMove = (e:MouseEvent) => {
  if (isDragging.current === false) {return};
  const currentMousePos = {x:e.clientX , y:e.clientY};
  const dx = currentMousePos.x - mouseStartPos.current.x;
  const dy = currentMousePos.y - mouseStartPos.current.y;

  // setBoxPos({x:boxStartPos.current.x+dx, y:boxStartPos.current.y+dy});
  setBox((prev) =>
    prev.map((b) => {
      if (b.id === activeBoxId.current) {
        const leftBound = dx + b.x_start.left;
        const topBound = dy + b.y_start.top;
        const isleftBound = leftBound <= SNAP_THRESHOLD;

        const rightBound = dx + b.x_start.right;
        const rightThreshold =windowWidth-SNAP_THRESHOLD;
        console.log("RightThreshold: ",rightThreshold)
        console.log("Rightval: ",rightBound)

        const isrightBound = rightBound >= rightThreshold;
        console.log("RightBound ",isrightBound)

        console.log(isleftBound)
        showLeftPreview.current = isleftBound;
        showRightPreview.current = isrightBound;
        return {
          ...b,
          x: leftBound,
          y: topBound,
        };
      }
      return b;
    })
  );
}

const handleMouseUp = () => {
  if (isDragging.current && activeBoxId.current != null) {
    const id = activeBoxId.current;

    if (showRightPreview.current) {
      // Commit snap: make the window fill the left half
      setBox((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, snapped: {...b.snapped, right:true}  } : b
        )
      );
    }

    if (showLeftPreview.current) {
      // Commit snap: make the window fill the left half
      setBox((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, snapped: { ...b.snapped, left: true } } : b
        )
      );
    }
  }

  isDragging.current = false;
  activeBoxId.current = null;
  showLeftPreview.current=false;
  showRightPreview.current=false;

  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
};
const handleAddBox=()=>{
  setWindowOpen(true);

  // get viewport size
  const width = window.innerWidth;
  const height = window.innerHeight;

  // generate random positions, leaving some margin (e.g., 100px) so box stays visible
  const randomX = Math.floor(Math.random() * (width - 100));
  const randomY = Math.floor(Math.random() * (height - 100));

  const getHeadColor = getRandomHSL();
  const getBodyColor = getRandomHSL();

  const newBox: Box = {
      id: Date.now(),
      x: randomX, // default spawn location
      y: randomY,
      x_start: {left:0, right:0},
      y_start: {top:0, bottom:0},
      snapped: {left:false, right: false},
      color: {head: getHeadColor, body: getBodyColor}

    };
    setBox((prev)=>[...prev, newBox]);
  }

const handleCloseBox = (id : number) => {
  setBox((prev) => prev.filter((b) => b.id !== id));

}



  return (
    <>
      <button 
        className="bg-blue-500 w-12 h-12 rounded-full text-2xl text-white fixed bottom-6 right-6 cursor-pointer z-999"
        onClick = {handleAddBox}
        // onClick = {() =>  setWindowOpen(true);}
      >
        +
      </button>
      {isDragging.current && (showLeftPreview.current || showRightPreview.current) && (
        <div
          className= {`top-0 h-[100vh] bg-gray-400 opacity-10 fixed
                      ${showLeftPreview.current? 'left-0 w-[50vw]':showRightPreview.current? 'right-0 w-[50vw]':''}`}
        > 
        </div>
      )}
      
      {(windowOpen) && (
        <div 
          className="flex flex-col justify-center items-center h-screen"    
        >
        {box.map((box)=>(
           
          <div
            onMouseDown={(e) => handleMouseDown(e, box)}
            // onMouseDown={handleMouseDown}
            key={box.id}
            style={
              box.snapped.left
                ? {
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    cursor: 'grab',
                    zIndex: 10,
                  }
                : box.snapped.right
                ? {
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    cursor: 'grab',
                    zIndex: 10,
                  }
                :
                {
                    top: `${box.y}px`,
                    left: `${box.x}px`,
                    cursor: 'grab',
                    position: 'absolute',
                    zIndex: 10,
                  }
            }
          >
            <div className={`p-2 shadow-md rounded-t-lg 
                            ${box.snapped.left || box.snapped.right ? 'w-[50vw]' : 'w-40'}
                            `}
                  style={{backgroundColor: box.color.head}}
            >
              <div className="flex justify-end items-center">
                <button className="text-white font-bold hover:text-gray-300 cursor-pointer" onClick = {()=>handleCloseBox(box.id)}>X</button>
              </div>
            </div>
            <div className={`p-3 rounded-b-lg shadow-md 
                            ${box.snapped.left || box.snapped.right? 'w-[50vw] h-[100vh]' : 'w-40 h-40'}
                            `}
                style={{backgroundColor: box.color.body}}

            >

            </div>
          </div>
        ))}
        </div>

      )}
    </>
  )
}

export default App
