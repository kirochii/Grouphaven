import { Button, Input, Text, View, XStack, YStack, Image, Spinner } from 'tamagui'
import React from 'react'
import { signInWithEmail } from '../utils/Account'

export default function SignIn() {
  const [status, setStatus] = React.useState<'idle' | 'submitting'>('idle')
  const [error, setError] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignIn = async () => {
    setStatus('submitting');

    const response = await signInWithEmail(email, password);

    if (response === true) {
      window.location.replace('../(drawer)/dashboard');
    } else {
      setError('⚠︎ Incorrect login credentials');
      setStatus('idle');
    }
  };

  return (
    <XStack f={1} w="100%" h="100%" bg="$background">
      {/* Left Panel */}
      <YStack f={2} jc="center" ai="center" bg='#519CFF'>

        <YStack>
          <XStack jc="center" ai="center">
            <Image
              source={require('../assets/iconWhite.png')}
              width={100}
              height={100}
            />

            <Text color="white" fontSize={72} fontWeight="bold">
              GROUPHAVEN
            </Text>
          </XStack>

          <View
            height={5}
            width="100%"
            bg="white"
            my="$4"
          />

          <Text color="white" textAlign="center" fontSize={56} fontWeight="bold">
            ADMIN PORTAL
          </Text>
        </YStack>

      </YStack>

      {/* Right Panel */}
      <YStack f={1} jc="center" ai="center" gap="$4">
        <Text fontSize={32} fontWeight="bold">SIGN IN</Text>

        <Input placeholder="Email" value={email} onChangeText={setEmail} w={250} />

        <Input placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} w={250} />

        <Button icon={status === 'submitting' ? () => <Spinner /> : undefined} w={250} disabled={status !== 'idle'}
          onPress={() => {
            handleSignIn();
          }}>
          LOGIN
        </Button>

        <XStack h="$1" alignItems="center">
          {error && <Text color="red" fontSize={16}>{error}</Text>}
        </XStack>
      </YStack>
    </XStack>
  )
}
