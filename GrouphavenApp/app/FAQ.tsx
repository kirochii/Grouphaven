import { StyleSheet, View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, List } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';

export default function FAQ() {
    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => router.back()}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>FAQ</Text>
                    </View>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    <Text style={styles.titleText}>Frequently Asked Questions</Text>

                    <List.Section>
                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="What is Grouphaven?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Grouphaven is a community matching application that aims to match users into small curated groups based on your input criterias." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Why did my verification get rejected?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Your verification photo is most likely invalid. Please ensure your verification photo complies with the provided guidelines." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Why can I only upload 6 photos?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Grouphaven is a user-matching platform, not a social media app, so photo uploads are limited to 6." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Are there any paid features?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="There are currently no paid features for Grouphaven users." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Why can't I host?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Only verified users are allowed to host. Please verify your account to get hosting privileges." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="What do trusted users get?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Trusted users are matched exclusively with other trusted users, enhancing safety and reliability within the platform." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Why is the matchmaking inaccurate?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="The matchmaking algorithm operates on a best-effort basis, and matches may not always fully align with your criteria." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Why can't I change my details?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Restrictions on changing your name, age, or gender help maintain user safety and prevent misuse of the platform." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="How do I get trusted status?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Ensure your profile is verified and complete tasks as host. As you complete task, your trust level will increase. You will be awarded with the trusted status when your trust level reaches 100%." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="When does matchmaking occur?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Matchmaking begins at the start of every hour. If you did not get matched into a group, there are no other users compatible with your preferences." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="How can I get matched quicker?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Disable same gender only matching and leave your interests field as blank. This will increase the number of users that fit your criteria." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="How do I get verified?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Submit a verification photo for moderator review. Ensure your photo follows the guidelines." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Is my personal data safe on Grouphaven?">
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Yes, Grouphaven prioritizes user privacy and secures your data according to industry standards." />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Is there a limit to how many groups I can join?"
                        >
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="There are no limits to the number of groups you can join at once."
                            />
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={styles.accordionTitle}
                            style={styles.accordion}
                            rippleColor="transparent"
                            title="Does Grouphaven support international users?"
                        >
                            <List.Item
                                titleStyle={{ flexWrap: 'wrap' }}
                                titleNumberOfLines={0}
                                title="Grouphaven is currently available in Malaysia. We plan to expand support for more countries in the future."
                            />
                        </List.Accordion>


                    </List.Section>
                </ScrollView>
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "white",
        paddingTop: "5%",
    },
    header: {
        height: "5%",
        flexDirection: "row",
        alignItems: "center",
    },
    headerText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#32353b',
        textAlign: "center",
    },
    textContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContainer: {
        flex: 1,
        padding: '5%',
    },
    titleText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#32353b',
        paddingLeft: "4%",
    },
    accordion: {
        backgroundColor: 'white',
        borderRadius: 8,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#32353b',
    },
});
