import { useEffect, useState } from 'preact/hooks';
import { Stepper } from '../Stepper';
import { Step0, ValidTeamType } from './Step0';
import { Step1, ValidTeamSize } from './Step1';
import { Step2 } from './Step2';
import { httpGet } from '../../lib/http';
import { getUrlParams, setUrlParams } from '../../lib/browser';
import { pageProgressMessage } from '../../stores/page';
import type { TeamResourceConfig } from './RoadmapSelector';

export interface TeamDocument {
  _id?: string;
  name: string;
  avatar?: string;
  creatorId: string;
  links: {
    website?: string;
    github?: string;
    linkedIn?: string;
  };
  type: ValidTeamType;
  canMemberSendInvite: boolean;
  teamSize?: ValidTeamSize;
  createdAt: Date;
  updatedAt: Date;
}

export function CreateTeamForm() {
  // Can't use hook `useParams` because it runs asynchronously
  const { s: queryStepIndex, t: teamId } = getUrlParams();

  const [team, setTeam] = useState<TeamDocument>();

  const [loadingTeam, setLoadingTeam] = useState(!!teamId && !team?._id);
  const [stepIndex, setStepIndex] = useState(0);

  async function loadTeam(
    teamIdToFetch: string,
    requiredStepIndex: number | string
  ) {
    const { response, error } = await httpGet<TeamDocument>(
      `${import.meta.env.PUBLIC_API_URL}/v1-get-team/${teamIdToFetch}`
    );

    if (error || !response) {
      alert('Error loading team');
      window.location.href = '/account';
      return;
    }

    const requiredStepIndexNumber = parseInt(requiredStepIndex as string, 10);
    const completedSteps = Array(requiredStepIndexNumber).fill(1).map((_, counter) => counter)

    setTeam(response);
    setSelectedTeamType(response.type);
    setCompletedSteps(completedSteps);
    setStepIndex(requiredStepIndexNumber);

    pageProgressMessage.set('Fetching skill config');
    await loadTeamResourceConfig(teamIdToFetch);
  }

  const [teamResourceConfig, setTeamResourceConfig] =
    useState<TeamResourceConfig>([]);

  async function loadTeamResourceConfig(teamId: string) {
    const { error, response } = await httpGet<TeamResourceConfig>(
      `${import.meta.env.PUBLIC_API_URL}/v1-get-team-resource-config/${teamId}`
    );
    if (error || !Array.isArray(response)) {
      console.error(error);
      return;
    }

    setTeamResourceConfig(response);
  }

  useEffect(() => {
    if (!teamId || !queryStepIndex || team) {
      return;
    }

    pageProgressMessage.set('Fetching team');
    setLoadingTeam(true);
    loadTeam(teamId, queryStepIndex).finally(() => {
      setLoadingTeam(false);
      pageProgressMessage.set('');
    });

    // fetch team and move to step
  }, [teamId, queryStepIndex]);

  const [selectedTeamType, setSelectedTeamType] = useState<ValidTeamType>(
    team?.type || 'company'
  );

  const [completedSteps, setCompletedSteps] = useState([0]);
  if (loadingTeam) {
    return null;
  }

  let stepForm = null;
  if (stepIndex === 0) {
    stepForm = (
      <Step0
        team={team}
        selectedTeamType={selectedTeamType}
        setSelectedTeamType={setSelectedTeamType}
        onStepComplete={() => {
          if (team?._id) {
            setUrlParams({ t: team._id, s: '1' });
          }

          setCompletedSteps([0]);
          setStepIndex(1);
        }}
      />
    );
  } else if (stepIndex === 1) {
    stepForm = (
      <Step1
        team={team}
        onBack={() => {
          if (team?._id) {
            setUrlParams({ t: team._id, s: '0' });
          }

          setStepIndex(0);
        }}
        onStepComplete={(team: TeamDocument) => {
          const createdTeamId = team._id!;

          setUrlParams({ t: createdTeamId, s: '2' });

          setCompletedSteps([0, 1]);
          setStepIndex(2);
          setTeam(team);
        }}
        selectedTeamType={selectedTeamType}
      />
    );
  } else if (stepIndex === 2) {
    stepForm = (
      <Step2
        team={team!}
        teamResourceConfig={teamResourceConfig}
        setTeamResourceConfig={setTeamResourceConfig}
        onBack={() => {
          if (team) {
            setUrlParams({ t: team._id!, s: '1' });
          }

          setStepIndex(1);
        }}
        onNext={() => {
          setUrlParams({ t: teamId!, s: '3' });
          setCompletedSteps([0, 1, 2]);
          setStepIndex(3);
        }}
      />
    );
  }

  return (
    <div className={'mx-auto max-w-[700px] py-6'}>
      <div className={'mb-8 flex flex-col items-center'}>
        <h1 className={'text-4xl font-bold'}>Create Team</h1>
        <p className={'mt-2 text-gray-500'}>
          Complete the steps below to create your team
        </p>
      </div>
      <div className="mb-8 mt-8 flex w-full">
        <Stepper
          activeIndex={stepIndex}
          completeSteps={completedSteps}
          steps={[
            { label: 'Type' },
            { label: 'Details' },
            { label: 'Skills' },
            { label: 'Members' },
          ]}
        />
      </div>

      {stepForm}
    </div>
  );
}
