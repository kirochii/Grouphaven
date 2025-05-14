import { Stack } from 'expo-router';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { checkSession } from '../../utils/Account'
import React from 'react';

export default function VerifyUsers() {
    React.useEffect(() => {
        const checkAuth = async () => {
            const loggedIn = await checkSession();

            if (!loggedIn) {
                window.location.replace('/');
            }
        };

        checkAuth();
    }, []);

    return (
        <>
            <Stack.Screen options={{ title: 'Verify Users' }} />
            <Container>
                <ScreenContent path="app/(drawer)/verifyUsers.tsx" title="Verify Users" />
            </Container>
        </>
    );
}
