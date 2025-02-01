import './index.css';

const QuestionCard = (props) => {
    const { questionDetails, questionIndex, selectedAnswer, clickOption } = props;
    const { question, options } = questionDetails;
  
    const correctOption = options.find(option => option.isCorrect);
  
    const onClickOption = (optionId, isCorrect) => {
        if (!selectedAnswer) {
            clickOption(questionIndex, optionId, isCorrect);
        }
    };
  
    return (
        <div className="question-container">
            <p className="question">{question}</p>
            <form id="question">
                <fieldset className="options-container">
                    {options.map(eachOption => {
                        const isSelected = selectedAnswer?.optionId === eachOption.id;
                        const isCorrect = eachOption.isCorrect;
                        const wasAnswered = selectedAnswer !== undefined;

                        let optionClass = "option-label"; // Default styling class
                        if (isSelected && !isCorrect) {
                            optionClass = "selected-incorrect";
                        } else if (wasAnswered && isCorrect) {
                            optionClass = "highlight-correct";
                        }

                        return (
                            <label
                                key={eachOption.id}
                                className={optionClass}
                                htmlFor={`option-${eachOption.id}`}
                            >
                                <input
                                    type="radio"
                                    value={eachOption.optionName}
                                    onChange={() => onClickOption(eachOption.id, isCorrect)}
                                    name={`options-${questionIndex}`}
                                    disabled={wasAnswered}
                                    className="radio-icon"
                                    id={`option-${eachOption.id}`}
                                />
                                {eachOption.optionName}
                            </label>
                        );
                    })}
                </fieldset>
            </form>
  
            {selectedAnswer && !selectedAnswer.isCorrect && (
                <p className="correct-answer">
                    Correct Answer: <strong className="correct">{correctOption.optionName}</strong>
                </p>
            )}
        </div>
    );
};
  
export default QuestionCard;
