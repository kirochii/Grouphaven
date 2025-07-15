import { StyleSheet, View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Provider as PaperProvider, Text, Button, IconButton, Switch, Searchbar, Chip } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { allInterests } from '../utils/interests';
import { joinQueue, leaveQueue } from '../utils/Account';

const { width } = Dimensions.get('window');

export default function MatchPreference() {
    const [genderSwitch, setGenderSwitch] = React.useState(false);
    const [hostSwitch, setHostSwitch] = React.useState(false);

    const onGenderSwitch = () => setGenderSwitch(!genderSwitch);
    const onHostSwitch = () => setHostSwitch(!hostSwitch);

    const [ageRange, setAgeRange] = React.useState([18, 39]);
    const [groupRange, setGroupRange] = React.useState([3, 5]);

    const [interestQuery, setInterestQuery] = React.useState('');
    const [interests, setInterests] = React.useState<string[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (interestQuery.trim() === '') {
            setFilteredSuggestions([]);
        } else {
            const filtered = allInterests.filter(
                (item) =>
                    item.toLowerCase().includes(interestQuery.toLowerCase()) &&
                    !interests.includes(item)
            );
            setFilteredSuggestions(filtered);
        }
    }, [interestQuery, interests]);

    const handleJoinQueue = async () => {
        const interestsDB = interests.length === 0 ? null : interests;

        joinQueue(hostSwitch, genderSwitch, ageRange[0], ageRange[1], groupRange[0], groupRange[1], interestsDB);
    };

    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => router.back()}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Match Preferences</Text>
                    </View>
                </View>

                <View style={styles.body}>
                    <View style={styles.row}>
                        <Text style={styles.label}>
                            Same Gender Only
                        </Text>
                        <Switch color='#519CFF' value={genderSwitch} onValueChange={onGenderSwitch} />
                    </View>

                    <View style={styles.slider}>
                        <View style={styles.row}>
                            <Text style={styles.label}>
                                Opt to Host
                            </Text>
                            <Switch color='#519CFF' value={hostSwitch} onValueChange={onHostSwitch} />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>
                            Age Range
                        </Text>
                        <Text style={styles.label}>
                            {`[${ageRange[0]} - ${ageRange[1]}]`}
                        </Text>
                    </View>

                    <View style={styles.slider}>
                        <MultiSlider
                            values={ageRange}
                            onValuesChange={setAgeRange}
                            min={18}
                            max={100}
                            step={1}
                            sliderLength={width - 50}
                            selectedStyle={{ backgroundColor: '#519CFF' }}
                            markerStyle={{
                                backgroundColor: '#519CFF',
                            }}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>
                            Group Size
                        </Text>
                        <Text style={styles.label}>
                            {`[${groupRange[0]} - ${groupRange[1]}]`}
                        </Text>
                    </View>

                    <View style={styles.slider}>
                        <MultiSlider
                            values={groupRange}
                            onValuesChange={setGroupRange}
                            min={3}
                            max={20}
                            step={1}
                            sliderLength={width - 50}
                            selectedStyle={{ backgroundColor: '#519CFF' }}
                            markerStyle={{
                                backgroundColor: '#519CFF',
                            }}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>
                            Interests
                        </Text>
                    </View>

                    <View style={styles.dropdownWrapper}>
                        <Searchbar
                            placeholder="Search"
                            onChangeText={setInterestQuery}
                            value={interestQuery}
                            style={styles.searchBar}
                            cursorColor={'#32353b'}
                        />

                        {filteredSuggestions.length > 0 && (
                            <ScrollView
                                style={styles.suggestionOverlay}
                                keyboardShouldPersistTaps="handled"
                            >
                                {filteredSuggestions.map((suggestion) => (
                                    <TouchableOpacity
                                        key={suggestion}
                                        onPress={() => {
                                            setInterests([...interests, suggestion]);
                                            setInterestQuery('');
                                        }}
                                        style={styles.suggestionItem}
                                    >
                                        <Text style={styles.suggestionText}>{suggestion}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <ScrollView
                        style={styles.scrollChipsContainer}
                    >
                        <View style={styles.chipsWrap}>
                            {interests.map((item) => (
                                <Chip
                                    key={item}
                                    onClose={() => setInterests(interests.filter((i) => i !== item))}
                                    style={styles.chip}
                                >
                                    {item}
                                </Chip>
                            ))}
                        </View>
                    </ScrollView>

                    <Button style={[styles.button]} labelStyle={styles.buttonText} mode="contained" onPress={() => {
                        handleJoinQueue();
                        router.back();
                    }}
                        rippleColor="transparent"
                    >
                        MATCH!
                    </Button>
                </View>
            </View>
        </PaperProvider>
    )
}


const styles = StyleSheet.create({
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
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "white",
        paddingTop: "5%",
    },
    body: {
        flex: 1,
        alignItems: 'center',
        padding: '5%',
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 18,
        color: '#32353b',
    },
    slider: {
        marginBottom: '5%',
    },
    searchBar: {
        marginTop: '3%',
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: '3%',
        width: '100%',
    },
    scrollChipsContainer: {
        height: '50%',
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        margin: '1%',
        borderRadius: 15,
        backgroundColor: '#E3F0FF',
    },
    dropdownWrapper: {
        position: 'relative',
    },
    suggestionOverlay: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        maxHeight: '200%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 5,
        zIndex: 1,
    },
    suggestionItem: {
        padding: '3%',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    suggestionText: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: '#32353b',
    },
    button: {
        backgroundColor: '#519CFF',
        borderRadius: 15,
        width: '30%',
        marginTop: '5%',
    },
    buttonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: "white",
    },
});