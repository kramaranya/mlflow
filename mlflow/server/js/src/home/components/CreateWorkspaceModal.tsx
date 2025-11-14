import { useIntl } from 'react-intl';
import { LegacyForm, Input } from '@databricks/design-system';
import { GenericInputModal } from '../../experiment-tracking/components/modals/GenericInputModal';
import { fetchAPI, getAjaxUrl, HTTPMethods } from '../../common/utils/FetchUtils';
import { validateWorkspaceName } from '../../common/utils/WorkspaceUtils';

const WORKSPACE_NAME_FIELD = 'workspaceName';
const WORKSPACE_DESCRIPTION_FIELD = 'workspaceDescription';
const WORKSPACE_ARTIFACT_ROOT_FIELD = 'workspaceArtifactRoot';

type CreateWorkspaceFormProps = {
  innerRef?: any;
};

const CreateWorkspaceForm = ({ innerRef }: CreateWorkspaceFormProps) => {
  const intl = useIntl();

  return (
    // @ts-expect-error TS(2322): Type '{ children: Element[]; ref: any; layout: "ve... Remove this comment to see the full error message
    <LegacyForm ref={innerRef} layout="vertical">
      <LegacyForm.Item
        label={intl.formatMessage({
          defaultMessage: 'Workspace Name',
          description: 'Label for create workspace modal to enter a valid workspace name',
        })}
        name={WORKSPACE_NAME_FIELD}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              defaultMessage: 'Please input a name for the new workspace.',
              description: 'Error message for name requirement in create workspace modal',
            }),
          },
          {
            validator: (_, value) => {
              if (!value) {
                // Let the required rule handle empty values
                return Promise.resolve();
              }
              const result = validateWorkspaceName(value);
              if (result.valid) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(result.error));
            },
          },
        ]}
      >
        <Input
          componentId="mlflow.home.create_workspace_modal.workspace_name_input"
          placeholder={intl.formatMessage({
            defaultMessage: 'Enter workspace name',
            description: 'Input placeholder for workspace name in create workspace modal',
          })}
          autoFocus
        />
      </LegacyForm.Item>
      <LegacyForm.Item
        name={WORKSPACE_DESCRIPTION_FIELD}
        label={intl.formatMessage({
          defaultMessage: 'Description (optional)',
          description: 'Label for description field in create workspace modal',
        })}
      >
        <Input
          componentId="mlflow.home.create_workspace_modal.workspace_description_input"
          placeholder={intl.formatMessage({
            defaultMessage: 'Enter workspace description',
            description: 'Input placeholder for workspace description in create workspace modal',
          })}
        />
      </LegacyForm.Item>
      <LegacyForm.Item
        name={WORKSPACE_ARTIFACT_ROOT_FIELD}
        label={intl.formatMessage({
          defaultMessage: 'Default Artifact Root (optional)',
          description: 'Label for default artifact root field in create workspace modal',
        })}
      >
        <Input
          componentId="mlflow.home.create_workspace_modal.workspace_artifact_root_input"
          placeholder={intl.formatMessage({
            defaultMessage: 'Enter default artifact root URI',
            description: 'Input placeholder for artifact root in create workspace modal',
          })}
        />
      </LegacyForm.Item>
    </LegacyForm>
  );
};

type CreateWorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (workspaceName: string) => void;
};

export const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }: CreateWorkspaceModalProps) => {
  const handleCreateWorkspace = async (values: any) => {
    const workspaceName = values[WORKSPACE_NAME_FIELD];
    const workspaceDescription = values[WORKSPACE_DESCRIPTION_FIELD];
    const workspaceArtifactRoot = values[WORKSPACE_ARTIFACT_ROOT_FIELD];

    const requestBody: { name: string; description?: string; default_artifact_root?: string } = {
      name: workspaceName,
    };

    if (workspaceDescription) {
      requestBody.description = workspaceDescription;
    }

    if (workspaceArtifactRoot) {
      requestBody.default_artifact_root = workspaceArtifactRoot;
    }

    try {
      await fetchAPI(getAjaxUrl('ajax-api/3.0/mlflow/workspaces'), {
        method: HTTPMethods.POST,
        body: JSON.stringify(requestBody),
      });

      onWorkspaceCreated(workspaceName);
    } catch (error: any) {
      // Convert error to string so Utils.logErrorAndNotifyUser can display it
      const errorMessage = error?.message || 'Failed to create workspace';
      throw errorMessage;
    }
  };

  return (
    <GenericInputModal
      title="Create Workspace"
      okText="Create"
      isOpen={isOpen}
      handleSubmit={handleCreateWorkspace}
      onClose={onClose}
    >
      <CreateWorkspaceForm />
    </GenericInputModal>
  );
};
