import { useNavigate } from 'react-router-dom';
import useEnvironmentForm from '../hooks/useEnvironmentForm';
import EnvironmentForm from '../EnvironmentForm/EnvironmentForm';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { Alert } from '@mui/material';
import { Button } from '@mui/material';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import usePermissions from 'hooks/api/getters/usePermissions/usePermissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';
import { Limit } from 'component/common/Limit/Limit';
import { useUiFlag } from 'hooks/useUiFlag';

const CreateEnvironment = () => {
    const { setToastApiError, setToastData } = useToast();
    const { uiConfig } = useUiConfig();
    const resourceLimitsEnabled = useUiFlag('resourceLimits');
    const environmentLimit = uiConfig.resourceLimits.environments;
    const navigate = useNavigate();
    const { environments } = useEnvironments();
    const canCreateMoreEnvs = environments.length < environmentLimit;
    const { createEnvironment, loading } = useEnvironmentApi();
    const { refetch } = usePermissions();
    const {
        name,
        setName,
        type,
        setType,
        getEnvPayload,
        validateEnvironmentName,
        clearErrors,
        errors,
    } = useEnvironmentForm();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = await validateEnvironmentName();
        if (validName) {
            const payload = getEnvPayload();
            try {
                await createEnvironment(payload);
                refetch();
                setToastData({
                    title: 'Environment created',
                    type: 'success',
                    confetti: true,
                });
                navigate('/environments');
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/environments' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getEnvPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <ConditionallyRender
            condition={resourceLimitsEnabled || canCreateMoreEnvs}
            show={
                <FormTemplate
                    loading={loading}
                    title='Create environment'
                    description='Environments allow you to manage your
                            product lifecycle from local development
                            through production. Your projects and
                            feature flags are accessible in all your
                            environments, but they can take different
                            configurations per environment. This means
                            that you can enable a feature flag in a
                            development or test environment without
                            enabling the feature flag in the
                            production environment.'
                    documentationLink='https://docs.getunleash.io/reference/environments'
                    documentationLinkLabel='Environments documentation'
                    formatApiCode={formatApiCode}
                >
                    <EnvironmentForm
                        errors={errors}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        validateEnvironmentName={validateEnvironmentName}
                        name={name}
                        type={type}
                        setName={setName}
                        setType={setType}
                        mode='Create'
                        clearErrors={clearErrors}
                        Limit={
                            <ConditionallyRender
                                condition={resourceLimitsEnabled}
                                show={
                                    <Limit
                                        name='environments'
                                        limit={environmentLimit}
                                        currentValue={environments.length}
                                    />
                                }
                            />
                        }
                    >
                        <CreateButton
                            name='environment'
                            permission={ADMIN}
                            disabled={!canCreateMoreEnvs}
                        />
                    </EnvironmentForm>
                </FormTemplate>
            }
            elseShow={
                <>
                    <PageContent
                        header={<PageHeader title='Create environment' />}
                    >
                        <Alert severity='error'>
                            <p>
                                Currently Unleash does not support more than{' '}
                                {environmentLimit} environments. If you need
                                more please reach out.
                            </p>
                        </Alert>
                        <br />
                        <Button
                            onClick={handleCancel}
                            variant='contained'
                            color='primary'
                        >
                            Go back
                        </Button>
                    </PageContent>
                </>
            }
        />
    );
};

export default CreateEnvironment;
