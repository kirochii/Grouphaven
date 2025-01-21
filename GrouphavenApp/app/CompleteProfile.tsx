import { StyleSheet, ImageBackground, View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Text, Button, TextInput, IconButton } from 'react-native-paper';
import DatePicker from '@dietime/react-native-date-picker';
import { Dropdown } from 'react-native-element-dropdown';
import React from 'react';

const { height } = Dimensions.get('window');

export default function CompleteProfile() {
    const [inputText, setInputText] = React.useState('');
    const [noticeText, setNoticeText] = React.useState('');
    const CITIES = [
        { label: 'Kuala Lumpur', value: 'kuala_lumpur' },
        { label: 'Seberang Jaya', value: 'seberang_jaya' },
        { label: 'Klang', value: 'klang' },
        { label: 'Ipoh', value: 'ipoh' },
        { label: 'George Town', value: 'george_town' },
        { label: 'Petaling Jaya', value: 'petaling_jaya' },
        { label: 'Kuantan', value: 'kuantan' },
        { label: 'Shah Alam', value: 'shah_alam' },
        { label: 'Sungai Petani', value: 'sungai_petani' },
        { label: 'Johor Bahru', value: 'johor_bahru' },
        { label: 'Kota Bharu', value: 'kota_bharu' },
        { label: 'Melaka', value: 'melaka' },
        { label: 'Kota Kinabalu', value: 'kota_kinabalu' },
        { label: 'Seremban', value: 'seremban' },
        { label: 'Sandakan', value: 'sandakan' },
        { label: 'Kuching', value: 'kuching' },
        { label: 'Kluang', value: 'kluang' },
        { label: 'Muar', value: 'muar' },
        { label: 'Pasir Gudang', value: 'pasir_gudang' },
        { label: 'Kuala Terengganu', value: 'kuala_terengganu' },
        { label: 'Sibu', value: 'sibu' },
        { label: 'Taiping', value: 'taiping' },
        { label: 'Kajang', value: 'kajang' },
        { label: 'Miri', value: 'miri' },
        { label: 'Teluk Intan', value: 'teluk_intan' },
        { label: 'Kulai', value: 'kulai' },
        { label: 'Alor Setar', value: 'alor_setar' },
        { label: 'Bukit Mertajam', value: 'bukit_mertajam' },
        { label: 'Lahad Datu', value: 'lahad_datu' },
        { label: 'Segamat', value: 'segamat' },
        { label: 'Tumpat', value: 'tumpat' },
        { label: 'Keningau', value: 'keningau' },
        { label: 'Batu Pahat', value: 'batu_pahat' },
        { label: 'Batu Gajah', value: 'batu_gajah' },
        { label: 'Tuaran', value: 'tuaran' },
        { label: 'Bayan Lepas', value: 'bayan_lepas' },
        { label: 'Port Dickson', value: 'port_dickson' },
        { label: 'Bintulu', value: 'bintulu' },
        { label: 'Tawau', value: 'tawau' },
        { label: 'Simanggang', value: 'simanggang' },
        { label: 'Labuan', value: 'labuan' },
        { label: 'Cukai', value: 'cukai' },
        { label: 'Butterworth', value: 'butterworth' },
        { label: 'Putrajaya', value: 'putrajaya' },
        { label: 'Taman Johor Jaya', value: 'taman_johor_jaya' },
        { label: 'Kangar', value: 'kangar' },
        { label: 'Others', value: 'others' },
    ];

    const [step, setStep] = React.useState(1);
    const [name, setName] = React.useState('');
    const [dob, setDOB] = React.useState<Date>(new Date());
    const [selectedGender, setSelectedGender] = React.useState<'male' | 'female' | null>(null);
    const [city, setCity] = React.useState<string>();
    const [isFocus, setIsFocus] = React.useState(false);

    React.useEffect(() => {
        if (step === 1) {
            setInputText('NAME');
            setNoticeText('Careful, you won\'t be able to change this later.');
        } else if (step === 2) {
            setInputText('DATE OF BIRTH');
        } else if (step === 3) {
            setInputText('GENDER');
        } else if (step === 4) {
            setInputText('CITY');
            setNoticeText('Don\'t worry, you will be able to change this later.');
        } else {
            setInputText('');
            setNoticeText('');
        }
    }, [step]);

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <TextInput
                        placeholder="eg. John Doe"
                        placeholderTextColor={"gray"}
                        mode='outlined'
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        value={name}
                        onChangeText={(value) => setName(value)}
                    />
                );
            case 2:
                return (
                    <View>
                        <View style={styles.DOBText}>
                            <Text style={styles.DateText}>Year</Text>
                            <Text style={styles.DateText}>Month</Text>
                            <Text style={styles.DateText}>Day</Text>
                        </View>

                        <DatePicker
                            height={0.15 * height}
                            value={dob}
                            fontSize={18}
                            onChange={(value: Date) => setDOB(value)}
                            format="yyyy-mm-dd"
                        />
                    </View>
                );
            case 3:
                return (
                    <View style={styles.genderContainer}>
                        <View style={styles.buttonContainer}>
                            <IconButton
                                icon="gender-male"
                                iconColor={selectedGender === 'male' ? '#519CFF' : '#949494'}
                                size={60}
                                onPress={() => setSelectedGender('male')}
                                rippleColor={"transparent"}
                            />
                            <Button mode='text' onPress={() => setSelectedGender('male')} labelStyle={[styles.genderText, { color: selectedGender === 'male' ? '#519CFF' : '#949494' }]} rippleColor="transparent">
                                Male
                            </Button>
                        </View>
                        <View style={styles.buttonContainer}>
                            <IconButton
                                icon="gender-female"
                                iconColor={selectedGender === 'female' ? '#519CFF' : '#949494'}
                                size={60}
                                onPress={() => setSelectedGender('female')}
                                rippleColor={"transparent"}
                            />
                            <Button mode='text' onPress={() => setSelectedGender('female')} labelStyle={[styles.genderText, { color: selectedGender === 'female' ? '#519CFF' : '#949494' }]} rippleColor="transparent">
                                Female
                            </Button>
                        </View>
                    </View>
                );
            case 4:
                return (
                    <Dropdown
                        style={[styles.dropdown, isFocus && { borderColor: '#519CFF' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        data={CITIES}
                        labelField="label"
                        valueField="value"
                        placeholder={'Select city'}
                        value={city}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={item => {
                            setCity(item.value);
                            setIsFocus(false);
                        }}
                    />
                );
            case 5:
                return (
                    <Text>5</Text>
                );
        }
    };













    return (
        <PaperProvider>
            <ImageBackground
                source={require('../assets/images/background.png')}
                resizeMode="cover"
                style={styles.background}
            >
                <View style={styles.container}>
                    <Text style={styles.headerText}>COMPLETE YOUR PROFILE</Text>
                    <Text style={styles.subText}>{`STEP ${step} OF 4`}</Text>
                    <View style={styles.promptContainer}>
                        {inputText ? <Text style={styles.inputText}>{inputText}</Text> : null}
                        {noticeText ? <Text style={styles.noticeText}>{noticeText}</Text> : null}

                        <View>{renderStepContent()}</View>

                        <View style={styles.LRcontainer}>
                            {step < 5 && (
                                <Button mode='text' onPress={() => setStep(step + 1)} labelStyle={styles.continueText} rippleColor="transparent">
                                    CONTINUE
                                </Button>
                            )}
                            {step > 1 && step < 5 && (
                                <Button mode='text' onPress={() => setStep(step - 1)} labelStyle={styles.backText} rippleColor="transparent">BACK</Button>
                            )}
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: '5%',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    headerText: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: 'white',
    },
    subText: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: 'white',
    },
    promptContainer: {
        marginTop: '5%',
        backgroundColor: "white",
        borderRadius: 15,
        padding: '4%',
    },
    inputText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#519CFF',
    },
    noticeText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#949494',
        marginBottom: '3%',
    },
    input: {
        backgroundColor: 'white',
        width: '100%',
        height: height * 0.05,
    },
    inputOutline: {
        borderColor: 'gray',
        borderRadius: 5,
        borderWidth: 1,
    },
    backText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#949494',
    },
    LRcontainer: {
        marginTop: '10%',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
    },
    DOBText: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        columnGap: '10%',
        marginBottom: '5%',
    },
    DateText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#949494',
        textDecorationLine: 'underline',
    },
    continueText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#519CFF',
    },
    genderContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        columnGap: '25%',
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    genderText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
    },
    dropdown: {
        height: 0.05 * height,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: '3%',
    },
    placeholderStyle: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
    },
    selectedTextStyle: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
    },
});
