import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: '212285871576-l610eo7ss6etgkcc7folec4trashcank.apps.googleusercontent.com',
});

type data ={
    idToken:string,
}
const App: React.FC = () => {
  const [signedin, setSignedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if the user is already logged in
    const subscriber = auth().onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
      if (user) {
        setSignedIn(true);  // User is logged in
      } else {
        setSignedIn(false); // User is not logged in
      }
      setLoading(false); // Stop loading indicator once user state is known
    });

    return subscriber; // Unsubscribe on unmount
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      // Trigger Google Sign-In flow
      const {data:data} = await GoogleSignin.signIn();
      
      // Check if userInfo and userInfo.data are not null
      if(data){
        const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
        
        // Sign in with the credential
        await auth().signInWithCredential(googleCredential);
        setSignedIn(true);
        console.log('User signed in successfully!');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in is in progress');
      } else {
        console.log('Something went wrong:', error.message);
      }
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      setSignedIn(false);
      console.log('User signed out!');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Google Sign-In</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {!signedin ? (
            <Button title="Sign in with Google" onPress={signInWithGoogle} />
          ) : (
            <>
              <Text style={styles.welcomeText}>Hey, Welcome here!</Text>
              <Button title="Sign out" onPress={signOut} />
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
});

export default App;
