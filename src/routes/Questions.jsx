import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import {useCallback, useEffect, useMemo, useState} from "react";
import apiClient from "../adapters/apiClient";
import { useSearchParams } from "react-router-dom";
import classNames from "classnames";

const Questions = () => {
  const client = apiClient()
  let [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [questionsAnswers, setQuestionsAnswers] = useState([
    {
      question: 'What is the capital of France?',
      answers: [
        {
          text: 'Paris',
          isCorrect: true
        },
        {
          text: 'London',
          isCorrect: false
        }
      ]
    },
    {
      question: 'How old was Jesus when he died?',
      answers: [
        {
          text: '19',
          isCorrect: true
        },
        {
          text: '22',
          isCorrect: false
        }
      ]
    }
  ])
  const [savedQuestionsAnswers, setSavedQuestionsAnswers] = useState([])
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0)
  const selectedQuestionAnswer = useMemo(() => {
    if (questionsAnswers.length === 0) {
      return null
    }
    if (selectedQuestionIndex > questionsAnswers.length - 1) {
      setSelectedQuestionIndex(questionsAnswers.length - 1)
      return questionsAnswers[questionsAnswers.length - 1]
    }
    return questionsAnswers[selectedQuestionIndex]
  }, [
    selectedQuestionIndex,
    questionsAnswers
  ])
  const totalQuestionsNumber = useMemo(() => {
    return questionsAnswers.length
  }, [
    questionsAnswers
  ])
  const selectedQuestionInvalidAnswers = useMemo(() => {
    if (selectedQuestionAnswer === null) return []
    return selectedQuestionAnswer.answers.filter((answer) => {
      return answer.isCorrect === false
    })
  }, [
    selectedQuestionIndex,
    questionsAnswers
  ])
  const fetchQuestionsAnswers = useCallback(async () => {
    const articles = searchParams.get('articles')
    try {
      setIsLoading(true)
      const response = await client.post('/quiz/generate', {
        urls: articles.split(',')
      })
      // setQuestionsAnswers(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [
    searchParams
  ])
  const saveQuestionAnswer = useCallback((questionAnswer) => {
    setSavedQuestionsAnswers(current => [...current, questionAnswer])
  }, [
    setSavedQuestionsAnswers
  ])

  const handleRemoveQuestionAnswer = useCallback((questionAnswerIndex) => {
    // Remove question from questions
    setQuestionsAnswers(current => [
      // Remove current question
      ...current.filter((question, index) => {
        return index !== selectedQuestionIndex
      })
    ])
  }, [

  ])

  useEffect(() => {
    fetchQuestionsAnswers()
  }, [
    searchParams
  ])

  return (
    <div className="flex">
      <div className=" w-2/4 h-screen bg-white flex flex-col justify-center">
        { questionsAnswers.length > 0 ? (
          <div className="w-4/6 mx-auto">
            <div className="my-4">
              <p
                className={'text-gray-600'}
              >
                Pytanie {selectedQuestionIndex + 1} z {totalQuestionsNumber}
              </p>
              <p className=" text-2xl font-medium">
                {selectedQuestionAnswer?.question}{" "}
                <span className=" text-xs">
                <EditIcon />
                Edytuj
              </span>
              </p>
            </div>
            { selectedQuestionAnswer.answers.map((answer, index) => {
              return (
                <div
                  key={index}
                  className={'mt-4'}
                >
                  <p
                    className={'text-gray-600'}
                  >
                    { answer.isCorrect ? 'Dobra odpowiedź':'Zła odpowiedź'}
                  </p>
                  <div
                    className={classNames(
                      'flex items-center gap-4 bg-slate-200 border-b-4 border-black box-border p-2 rounded-md',
                      answer.isCorrect ? 'border-b-green-600' : 'border-b-red-600'
                    )}
                  >
                    { answer.isCorrect ? (
                      <CheckIcon
                        w={6}
                        color="green"
                      />
                    ):(
                      <CloseIcon
                        w={3.5}
                        color="red"
                        className={'ml-1'}
                      />
                    )}
                    <p className="relative ml-1 w-full text-2xl font-light flex items-center">
                      <input
                        type={'text'}
                        value={answer.text}
                        className={'bg-transparent border-none outline-none grow flex flex-1'}
                        onInput={(event) => {
                          const value = event.target.value
                          setQuestionsAnswers(current => {
                            const newQuestionsAnswers = [...current]
                            newQuestionsAnswers[selectedQuestionIndex].answers[index].text = value
                            return newQuestionsAnswers
                          })
                        }}
                      />
                      <div
                        className={'absolute right-0 mr-2 flex items-center justify-center pointer-events-none'}
                      >
                        <EditIcon
                          w={5}
                          color={'#4A5568'}
                        />
                      </div>
                    </p>
                  </div>
                </div>
              )
            })}
            <div className="flex gap-4 mt-8 mb-4">
              {" "}
              <Button
                onClick={() => {
                  setSelectedQuestionIndex(selectedQuestionIndex - 1)
                }}
                disabled={selectedQuestionIndex === 0}
              >
                <ArrowBackIcon />
              </Button>
              <Button
                colorScheme="green"
                color="white"
                flexGrow={1}
                onClick={() => {
                  saveQuestionAnswer(questionsAnswers[selectedQuestionIndex])
                  handleRemoveQuestionAnswer(selectedQuestionIndex)
                }}
              >
                Zapisz do quizu
              </Button>
              <Button
                onClick={() => {
                  setSelectedQuestionIndex(selectedQuestionIndex + 1)
                }}
                disabled={selectedQuestionIndex === totalQuestionsNumber - 1}
              >
                <ArrowForwardIcon />
              </Button>
            </div>
            <div className="flex justify-center gap-1">
              <Button
                variant={"link"}
                onClick={() => handleRemoveQuestionAnswer(selectedQuestionIndex)}
                className={"hover:underline cursor-pointer"}
              >
                <CloseIcon w={2.5}/>
                <p className="ml-1 text-xs">Odrzuć</p>
              </Button>
            </div>
          </div>
        ):(
          <div className="w-4/6 mx-auto">
            <div className="my-4 text-center">
              <p>Baza pytań i odpowiedzi została wyczerpana.<br/> Możesz wyeksportować quiz!</p>
            </div>
          </div>
        )}
      </div>

      <div className=" w-2/4 h-screen bg-slate-100 flex flex-col justify-center">
        <div className=" w-4/6 h-4/6 my-auto mx-auto flex flex-col gap-4">
          <p className=" text-2xl font-medium">Zapisane pytania</p>
          { savedQuestionsAnswers.map((questionAnswer, index) => {
            return (
              <div className=" bg-slate-200 rounded-xl">
                <p className=" bg-white px-4 py-4 rounded-t-xl text-xl font-semibold">
                  {questionAnswer.question}
                </p>

                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="w-1 h-4 bg-green-600 rounded-md"></div>

                  <p className="text-base font-medium">
                    Poprawna odpowiedź: {questionAnswer.answers[0].text}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 pt-2 pb-3">
                  <div className="w-1 h-4 bg-red-600 rounded-md"></div>

                  <p className="text-base font-medium">
                    Niepoprawne odpowiedzi: {questionAnswer.answers.filter(answer => answer.isCorrect === false).map(answer => answer.text).join(', ')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <Button
          colorScheme="green"
          color="white"
          w={96}
          mb={20}
          disabled={savedQuestionsAnswers.length === 0}
          mx="auto"
        >
          Eksportuj quiz
        </Button>
      </div>
    </div>
  );
};

export default Questions;
