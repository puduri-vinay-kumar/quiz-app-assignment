
import { Component } from "react";
import { MdOutlineTimer } from "react-icons/md";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaMedal, FaTrophy, FaBook } from "react-icons/fa";
import "./App.css";
import QuestionCard from "./components/QuestionCard";

const appStatusConstants = {
  initial: 'INITIAL',
  running: 'RUNNING',
  failure: '  FAILURE',
  finished: 'FINISHED',
};

class App extends Component {
  state = {
    questionsList: [],
    activeQuestionIndex: 0,
    appStatus: appStatusConstants.initial,
    selectedAnswers: {}, 
    score: 0,
    attempted: 0,
    incorrect: 0,
    userName:"",
    errorMsg:false,
    timer: 600,
  };

  componentDidMount() {
    this.getQuestionsData();
  }

  getQuestionsData = async () => {
    const apiUrl = `https://api.allorigins.win/raw?url=https://api.jsonserve.com/Uw5CrX`;
    const response = await fetch(apiUrl);
    
    if (response.ok) {
      const data = await response.json();
      const updatedData = data.questions.map((eachQuestion, index) => ({
        id: index,
        question: eachQuestion.description,
        options: eachQuestion.options.map(eachOption => ({
          id: eachOption.id,
          optionName: eachOption.description,
          isCorrect: eachOption.is_correct,
        })),
      }));

      this.setState({ questionsList: updatedData });
    } else {
      this.setState({
        appStatus:appStatusConstants.failure,
      })
    }
  };

  clickOption = (questionIndex, optionId, isCorrect) => {
    this.setState(prevState => {
      const wasAttempted = prevState.selectedAnswers[questionIndex] !== undefined;
      const attempted = wasAttempted ? prevState.attempted : prevState.attempted + 1;
      const incorrect = isCorrect
        ? prevState.incorrect
        : wasAttempted
        ? prevState.incorrect
        : prevState.incorrect + 1;
      const score = isCorrect
        ? prevState.selectedAnswers[questionIndex]?.isCorrect
          ? prevState.score
          : prevState.score + 1
        : prevState.score;

      return {
        selectedAnswers: {
          ...prevState.selectedAnswers,
          [questionIndex]: { optionId, isCorrect },
        },
        score,
        attempted,
        incorrect,
      };
    });
  };

  onChangeUserName=(event)=> {
    
    this.setState({
      userName: event.target.value
    })
  }

  renderInitialPage = () => {
    const {userName,errorMsg} = this.state
    return (
    <div className="bg-container">
    <div className="initial-container">
      <h1 className="start-page-heading">Welcome!</h1>
      <input type="text" id="user-name" className="username-input" placeholder="enter username" onChange={this.onChangeUserName} value={userName} />
      <br/>
      {errorMsg && <span className="error-msg">please enter username</span>}
      <br/>
      <button type="button" className="start-button" onClick={this.clickStartButton}>
        Start Quiz
      </button>
    </div>
    </div>)
  };

  renderQuestionsCard = () => {
    const { questionsList, activeQuestionIndex, selectedAnswers,timer } = this.state;
    if (questionsList.length === 0) return <p>Loading Questions...</p>;
    const progressPercentage = ((activeQuestionIndex + 1) / questionsList.length) * 100;
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return (
      <div className="question-card">
      <div className="quiz-header">
      <span className="timer"> <MdOutlineTimer /> {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
      <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      <div className="quit-container">
      <p className="question-no">Question: {activeQuestionIndex+1}/10</p>
      <div className="quit-button-container" onClick={this.onQuit}>
      <IoIosCloseCircleOutline className="quit-icon" />
      <button className="quit-button" type="button" >
      Quit
    </button>
    </div>
    </div>
        <QuestionCard
          questionDetails={questionsList[activeQuestionIndex]}
          questionIndex={activeQuestionIndex}
          selectedAnswer={selectedAnswers[activeQuestionIndex]}
          clickOption={this.clickOption}
        />
        <div className="button-container">
          {activeQuestionIndex > 0 && (
            <button className="previous-button" type="button" onClick={this.onClickPrevious}>
              Previous
            </button>
          )}
          {activeQuestionIndex === questionsList.length - 1 ? (
            <button className="submit-button" type="button" onClick={this.onSubmit}>
              Submit
            </button>
          ) : (
            <button className="next-button" type="button" onClick={this.clickNext}>
              Next
            </button>
          )}
        </div>
        </div>
      </div>
    );
  };

  onQuit = () => {
    clearInterval(this.timerInterval);
    this.setState({
      appStatus: appStatusConstants.finished, 
    });
  };

  renderFinishedCard = () => {
    const { score, attempted, questionsList, incorrect,userName } = this.state;
    console.log(userName)
    const unattempted = questionsList.length - attempted;
    const getQuote = () => {
      const percentage = (score / 10) * 100;
      if (percentage === 100) {
        return ` Perfect! ${userName} You're a quiz master! Keep shining! `;
      } else if (percentage >= 80) {
        return ` Great job ${userName}! You nailed it! Keep up the good work! `;
      } else if (percentage >= 50) {
        return ` Not bad ${userName}! Keep practicing and you'll do even better! `;
      } else {
        return `Don't give up ${userName}! Learn from your mistakes and try again! `;
      }
    };
    return (
      <div className="results-container">
        <h1>Quiz Completed!</h1>
        <div className="score-container">
        <p className="score">Score: {score}</p>
        </div>
      <p className="badge"><span className="badge-text">Congratulations youn have won a badge</span> {this.assignBadge()}</p>
        <p className="attempted">Attempted: {attempted}</p>
        <p className="unattempted">Unattempted: {unattempted}</p>
        <p className="incorrect">Incorrect: {incorrect}</p>
        <p className="quiz-quote">{getQuote()}</p> 
        <div className="restart-container">
          <button type="button" class="restart-button" onClick={this.restart}>Restart</button>
        </div>
      </div>
    );
  };

   assignBadge = () => {
    const {score} = this.state
    if (score >= 8) {
      return <FaTrophy className="badge-icon gold" />;
    } else if (score >= 5) {
      return <FaMedal className="badge-icon silver" />;
    } else {
      return <FaBook className="badge-icon bronze" />;
    }
  };

  renderFailure =()=> (
    <p className="not-found"> Could not fetch data.....</p>
  )

  

  restart = ()=> {
    this.setState({
      appStatus: appStatusConstants.running,
      timer: 600,
      activeQuestionIndex: 0,
      selectedAnswers: {}, 
      score: 0,
      attempted: 0,
      incorrect: 0,
    })

    this.timerInterval = setInterval(() => {
      this.setState(prevState => {
        if (prevState.timer <= 1) {
          clearInterval(this.timerInterval);
          return { appStatus: appStatusConstants.finished }; 
        }
        return { timer: prevState.timer - 1 };
      });
    }, 1000);
    
  

    
  }

  renderSwitchCase = () => {
    const { appStatus } = this.state;
    switch (appStatus) {
      case appStatusConstants.running:
        return this.renderQuestionsCard();
      case appStatusConstants.finished:
        return this.renderFinishedCard();
      case appStatusConstants.initial: 
        return this.renderInitialPage();
      case appStatusConstants.failure:
        return this.renderFailure()

      default:
        return null;
    }
  };

  onClickPrevious = () => {
    this.setState(prevState => ({
      activeQuestionIndex: prevState.activeQuestionIndex - 1,
    }));
  };

  onSubmit = () => {
    clearInterval(this.timerInterval);
    this.setState({
      appStatus: appStatusConstants.finished,
    });
  };

  clickNext = () => {
    this.setState(prevState => ({
      activeQuestionIndex: prevState.activeQuestionIndex + 1,
    }));
  };

  clickStartButton = () => {
    const {userName}=this.state 
    if(userName!=="") {
      this.setState({
        appStatus: appStatusConstants.running,
       
      });
    } else {
      this.setState(prevState=>({
          errorMsg: true,
      }))

    }

    this.timerInterval = setInterval(() => {
      this.setState(prevState => {
        if (prevState.timer <= 1) {
          clearInterval(this.timerInterval);
          return { appStatus: appStatusConstants.finished }; 
        }
        return { timer: prevState.timer - 1 };
      });
    }, 1000);
    
  };


  render() {
    return <div className="quiz-app-container">{this.renderSwitchCase()}</div>;
  }
}

export default App;
