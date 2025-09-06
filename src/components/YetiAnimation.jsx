import React from "react";
import { useRive, useStateMachineInput } from "rive-react";
import "../styles/components/YetiAnimation.css";

const STATE_MACHINE_NAME = "State Machine 1";

function YetiAnimation({
  check,
  handsUp,
  look,
  isPeeking,
  triggerSuccess,
  triggerFail,
}) {
  const { rive, RiveComponent } = useRive({
    src: "/520-990-teddy-login-screen.riv",
    autoplay: true,
    stateMachines: STATE_MACHINE_NAME,
  });

  const stateSuccess = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    "success"
  );
  const stateFail = useStateMachineInput(rive, STATE_MACHINE_NAME, "fail");
  const stateHandUp = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    "hands_up"
  );
  const stateCheck = useStateMachineInput(rive, STATE_MACHINE_NAME, "Check");
  const stateLook = useStateMachineInput(rive, STATE_MACHINE_NAME, "Look");

  const statePeek = useStateMachineInput(rive, STATE_MACHINE_NAME, "peek"); // Input cho trạng thái peek

  // Update Rive inputs based on props
  React.useEffect(() => {
    if (stateCheck) stateCheck.value = check;
  }, [check, stateCheck]);

  React.useEffect(() => {
    if (stateHandUp) stateHandUp.value = handsUp;
  }, [handsUp, stateHandUp]);

  React.useEffect(() => {
    if (stateLook) stateLook.value = look;
  }, [look, stateLook]);

  // Cập nhật trạng thái peek dựa trên prop isPeeking
  React.useEffect(() => {
    if (statePeek) statePeek.value = isPeeking;
  }, [isPeeking, statePeek]);

  React.useEffect(() => {
    if (triggerSuccess && stateSuccess) stateSuccess.fire();
  }, [triggerSuccess, stateSuccess]);

  React.useEffect(() => {
    if (triggerFail && stateFail) stateFail.fire();
  }, [triggerFail, stateFail]);

  return (
    <div className="yeti-container">
      <RiveComponent />
    </div>
  );
}

export default YetiAnimation;
