import {useGetSettings} from "../../../hooks/get-hooks/useGetSettings";
import {useChangeSettings} from "../../../hooks/change-hooks/useChangeSettings";
import React, {useState} from "react";
import Modal from "../../containers/Modal/Modal";
import RadioInput from "../../inputs/RadioInput/RadioInput";
import ToggleButton from "../../buttons/ToggleButton/ToggleButton";
import Button from "../../buttons/Button/Button";

const ConfirmDeleteGroupModal = ({dismountModal, continueFunction, groupTitles}) => {
    const {data: settings} = useGetSettings();
    const {mutate: setSettings} = useChangeSettings();

    const [action, setAction] = useState(settings.defaults.deleteGroupAction);
    const [neverShow, setNeverShow] = useState(false);

    const handleConfirm = async () => {
        if (neverShow !== !settings.confirmDeleteGroup || action !== settings.defaults.deleteGroupAction) {
            await setSettings({...settings, confirmDeleteGroup: !neverShow, defaults: {...settings.defaults, deleteGroupAction: action}, priorityBounds: undefined});
        }
        continueFunction(action);
    }

    return (
        <Modal isOverlay={true} dismountFunction={dismountModal}>
            <div className={"Stack-Container Big-Gap"}>
                <div className={"Horizontal-Flex-Container Space-Around"}>
                    <div className={`Display Horizontal-Flex-Container`}>
                        Confirm delete action
                    </div>
                </div>
                <div className={"Label"}>
                    You are about to delete the
                    {
                        groupTitles.length === 1 && (
                            <span>
                                &nbsp;time-group "{groupTitles[0]}"
                            </span>
                        )
                    }
                    {
                        groupTitles.length > 1 && (
                            <>
                                following time-groups:
                                {
                                    groupTitles.map((title) => (
                                        <>
                                            {title}
                                        </>
                                    ))
                                }
                            </>
                        )
                    }
                    <br />
                    What should happen to the tasks that use it?
                </div>
            </div>
            <div className={'Stack-Container'} onChange={(e) => setAction(e.target.value)}>
                <RadioInput value={"Keep their repeat details"} checked={action === "Keep their repeat details"} />
                <RadioInput value={"Remove their repeat details"} checked={action === "Remove their repeat details"} />
                <RadioInput value={"Delete them"} checked={action === "Delete them"} />
            </div>
            <div className={'Horizontal-Flex-Container'}>
                Remember my choice and never show this again
                <ToggleButton isToggled={neverShow} setIsToggled={setNeverShow}></ToggleButton>
            </div>
            <div className={'Horizontal-Flex-Container Space-Between'}>
                <Button
                    size={'large'}
                    filled={false}
                    onClick={dismountModal}
                >
                    Cancel
                </Button>
                <Button
                    size={'large'}
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>
            </div>
        </Modal>
    );
}

export default ConfirmDeleteGroupModal;