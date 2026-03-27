import { StyleSheet } from 'react-native';

import Typography from './typography';

export const getStyles = (Colors) => StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: Colors.backgroundCard,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 20, // safe area for iOS roughly
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
    iconButton: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabWrapper: {
        top: -24, // push it up above the nav bar
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.backgroundCardDark,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    navDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.backgroundCardDark,
        marginTop: 4,
    }
});


