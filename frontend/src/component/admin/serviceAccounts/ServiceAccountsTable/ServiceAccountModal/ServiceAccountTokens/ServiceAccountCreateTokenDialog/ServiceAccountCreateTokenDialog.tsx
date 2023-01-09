import { useEffect, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import {
    calculateExpirationDate,
    ExpirationOption,
    IPersonalAPITokenFormErrors,
    PersonalAPITokenForm,
} from 'component/user/Profile/PersonalAPITokensTab/CreatePersonalAPIToken/PersonalAPITokenForm/PersonalAPITokenForm';
import { ICreatePersonalApiTokenPayload } from 'hooks/api/actions/usePersonalAPITokensApi/usePersonalAPITokensApi';
import { IServiceAccount } from 'interfaces/service-account';

const DEFAULT_EXPIRATION = ExpirationOption['30DAYS'];

interface IServiceAccountCreateTokenDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    serviceAccount: IServiceAccount;
    onCreateClick: (newToken: ICreatePersonalApiTokenPayload) => void;
}

export const ServiceAccountCreateTokenDialog = ({
    open,
    setOpen,
    serviceAccount,
    onCreateClick,
}: IServiceAccountCreateTokenDialogProps) => {
    const [patDescription, setPatDescription] = useState('');
    const [patExpiration, setPatExpiration] =
        useState<ExpirationOption>(DEFAULT_EXPIRATION);
    const [patExpiresAt, setPatExpiresAt] = useState(
        calculateExpirationDate(DEFAULT_EXPIRATION)
    );
    const [patErrors, setPatErrors] = useState<IPersonalAPITokenFormErrors>({});

    useEffect(() => {
        setPatDescription('');
        setPatExpiration(DEFAULT_EXPIRATION);
        setPatExpiresAt(calculateExpirationDate(DEFAULT_EXPIRATION));
        setPatErrors({});
    }, [open]);

    const isDescriptionUnique = (description: string) =>
        !serviceAccount.tokens?.some(
            token => token.description === description
        );

    const isPATValid =
        patDescription.length &&
        isDescriptionUnique(patDescription) &&
        patExpiresAt > new Date();

    return (
        <Dialogue
            open={open}
            primaryButtonText="Create token"
            secondaryButtonText="Cancel"
            onClick={() =>
                onCreateClick({
                    description: patDescription,
                    expiresAt: patExpiresAt,
                })
            }
            disabledPrimaryButton={!isPATValid}
            onClose={() => {
                setOpen(false);
            }}
            title="New token"
        >
            <PersonalAPITokenForm
                description={patDescription}
                setDescription={setPatDescription}
                isDescriptionUnique={isDescriptionUnique}
                expiration={patExpiration}
                setExpiration={setPatExpiration}
                expiresAt={patExpiresAt}
                setExpiresAt={setPatExpiresAt}
                errors={patErrors}
                setErrors={setPatErrors}
            />
        </Dialogue>
    );
};
