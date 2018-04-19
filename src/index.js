import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ButtonToolbar, MenuItem, DropdownButton} from 'react-bootstrap'

class Box extends React.Component{
    selectBox = () =>{
        this.props.selectBox(this.props.row, this.props.cols)
    };
    render(){
        return(
            <div
                className={this.props.boxClass}
                id={this.props.id}
                onClick={this.selectBox}//instead of this.props.selectBox bc creating one in this class with pass in values
            />
        )
    }
}

class Grid extends React.Component{
    render(){
        const width = this.props.cols*14;
        let rowsArr = [];
        let boxClass ="";

        for (let i=0;i<this.props.rows; i++){
            for (let j=0;j<this.props.cols; j++){
                let boxId = i + "_" + j;
                boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
                rowsArr.push(
                    <Box
                        boxClass={boxClass}
                        key={boxId}
                        boxID={boxId}
                        row={i}
                        col={j}
                        selectBox={this.props.selectBox}
                    />
                );
            }
        } // should be done in a map

        return(
            <div className="grid" style={{width:width}}>
                {rowsArr}
            </div>
        );
    }
}

class Buttons extends React.Component{
    handleSelect = (evt)=>{
        this.props.gridSize(evt);
    };
    render(){
        return(
            <div className="center">
                <ButtonToolbar>
                    <button className="btn btn-default" onClick={this.props.playButton}>
                        Play
                    </button>
                    <button className="btn btn-default" onClick={this.props.pauseButton}>
                        Pause
                    </button>
                    <button className="btn btn-default" onClick={this.props.clear}>
                        Clear
                    </button>
                    <button className="btn btn-default" onClick={this.props.slow}>
                        Slow
                    </button>
                    <button className="btn btn-default" onClick={this.props.fast}>
                        Fast
                    </button>
                    <button className="btn btn-default" onClick={this.props.seed}>
                        Seed
                    </button>
                    <DropdownButton
                        title="Gride Size"
                        id="size-menu"
                        onSelect={this.handleSelect}
                    >
                    <MenuItem eventKey="1">20*10</MenuItem>
                    <MenuItem eventKey="2">50*50</MenuItem>
                    <MenuItem eventKey="3">70*50</MenuItem>
                    </DropdownButton>
                </ButtonToolbar>
            </div>
        )
    }
}

class Main extends React.Component {
    constructor(){
        super();
        this.speed = 100;
        this.rows = 30;
        this.cols = 50;

        this.state={
            generation:0,
            gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false))
        }
    }

    selectBox = (row, col) => {//when selected, set value to true
        let gridCopy = arrayClone(this.state.gridFull); //in react you never want to direct update state, make a copy
        gridCopy[row][col] = !gridCopy[row][col];
        this.setState({ //whenever updating state use setState
           gridFull:gridCopy
        })
    };

    seed = () => {
        let gridCopy = arrayClone(this.state.gridFull);
        for (let i=0; i<this.rows; i++){
            for (let j=0; j<this.cols; j++){
                if (Math.floor(Math.random()*4)===1){
                    gridCopy[i][j]=true;//25% cance of lighting the grid
                }
            }
        }
        this.setState({ //whenever upding state use this
            gridFull:gridCopy
        });
    };

    play = () => {
        let g = this.state.gridFull;
        let g2 = arrayClone(this.state.gridFull);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let count = 0; //# of live neighbors
                if (i > 0) if (g[i - 1][j]) count++;
                if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
                if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
                if (j < this.cols - 1) if (g[i][j + 1]) count++;
                if (j > 0) if (g[i][j - 1]) count++;
                if (i < this.rows - 1) if (g[i + 1][j]) count++;
                if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
                if (i < this.rows - 1 && this.cols - 1) if (g[i + 1][j + 1]) count++;
                if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
                if (!g[i][j] && count === 3) g2[i][j] = true;
            }
        }
        this.setState({
            gridFull:g2,
            generation:this.state.generation+1
        })
    };

    //let the random run on an interval
    playButton = ()=> {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(this.play, this.speed);
    };

    pauseButton = () => {
        clearInterval(this.intervalId)
    };

    slow = () => {
      this.speed = 1000;
      this.playButton();
    };
    fast = () => {
        this.speed = 100;
        this.playButton();
    };
    clear = () =>{
        let grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false)); //refactor
        this.setState({
            gridFull:grid,
            generation:0
        });
    };
    gridSize = (size)=>{
        switch(size){
            case "1":
                this.cols = 20;
                this.rows = 10;
            break;
            case "2":
                this.cols = 50;
                this.rows = 30;
            break;
            case "3":
                this.cols = 50;
                this.rows = 70;
        }
        this.clear();
    };

    componentDidMount(){ //this is for
        this.seed();
        this.playButton()
    }

    render(){
        return(
            <div>
                <h1>The Game of Life</h1>
                <Buttons
                    playButton={this.playButton}
                    pauseButton={this.pauseButton}
                    slow={this.slow}
                    fast={this.fast}
                    clear={this.clear}
                    seed={this.seed}
                    gridSize={this.gridSize}
                />
                <Grid
                    gridFull={this.state.gridFull}
                    rows={this.rows}
                    cols={this.cols}
                    selectBox={this.selectBox}
                />
                <h2>Generations:{this.state.generation}</h2>
            </div>
        );
    }
}

function arrayClone(arr){
    return JSON.parse(JSON.stringify(arr));//deep clone using JSON trick
}

ReactDOM.render(<Main />, document.getElementById('root'));
