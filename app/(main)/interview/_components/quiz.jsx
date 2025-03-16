"use client";

import { generateQuiz, savingQuizResult } from "@/actions/interview";
import useFetch from "@/hooks/use-Fetch";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import QuizResult from "./quiz-Result";

const Quiz = () => {
  const [question, setQuestion] = useState(0);
  const [explanation, setExplanation] = useState(false);
  const [answer, setAnswer] = useState([]);

  const {
    loading: quizLoading,
    data: quizData,
    fn: generateQuizFn,
  } = useFetch(generateQuiz);
  const {
    loading: savingQuiz,
    data: savingData,
    fn: savingQuizFn,
    setData: setSavingData,
  } = useFetch(savingQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswer(new Array(quizData.length).fill(null));
    }
  }, [quizData]);
  if (quizLoading) {
    console.log(quizLoading);
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  const handleChange = (ans) => {
    const Updated = [...answer];

    Updated[question] = ans;
    setAnswer(Updated);
  };
  const handleNext = () => {
    if (question < quizData.length - 1) {
      setExplanation(false);
      setQuestion(question + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!quizData || !Array.isArray(quizData) || quizData.length === 0) {
      console.error("Error: quizData is invalid", quizData);
      toast.error("Quiz data is invalid!");
      return;
    }

    if (!Array.isArray(answer) || answer.length === 0) {
      console.error("Error: answer array is invalid", answer);
      toast.error("No answers provided!");
      return;
    }

    let score = 0;
    answer.forEach((ans, index) => {
      if (ans === quizData[index].correctAnswer) {
        score++;
      }
    });
    // console.log("Sending data:", { questions: quizData, answer, score }); // Debug log

    try {
      await savingQuizFn({ questions: quizData, answer, score });
      toast.success("Quiz Completed");
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error(error.message);
    }

    console.log("Final Score:", score);
  };

  const startNewQuiz = () => {
    setQuestion(0);
    setExplanation(false);
    setAnswer([]);
    generateQuizFn();
    setSavingData(null);
  };

  // Show results if quiz is completed
  if (savingData) {
    return (
      <div className="mx-2">
        <QuizResult result={savingData} onStartNew={startNewQuiz} />
      </div>
    );
  }
  console.log(savingData);

  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const Que = quizData[question];
  return (
    <Card className="mx-2 ">
      <CardHeader>
        <CardTitle>
          Question {question + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>
      <CardDescription className="mx-5 text-xl mb-3">
        {Que.question}
      </CardDescription>
      <CardContent className="space-y-4">
        <RadioGroup
          onValueChange={handleChange}
          className="space-y-2"
          value={answer[question]}
        >
          {Que.options.map((op, index) => {
            return (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={op} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{op}</Label>
              </div>
            );
          })}
        </RadioGroup>
        {explanation ? (
          <p className="bg-gray-700 p-1 ">{Que.explanation}</p>
        ) : (
          ""
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          onClick={() => setExplanation(true)}
          disabled={!answer[question]}
        >
          Show Explanation
        </Button>
        <Button onClick={handleNext} disabled={answer[question] == null}>
          {savingQuiz && (
            <Loader2 className="mt-4" width={"100%"} color="gray" />
          )}
          {question < quizData.length - 1 ? "Next" : "Finish"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Quiz;
