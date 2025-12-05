import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { diffWords } from 'diff';

const DiffView = ({ oldText, newText, theme }) => {
    const diff = diffWords(oldText || '', newText || '');

    return (
        <View style={styles.container}>
            {diff.map((part, index) => {
                let color = theme.text;
                let backgroundColor = 'transparent';
                let textDecorationLine = 'none';

                if (part.added) {
                    // Green for additions (like GitHub)
                    color = '#22863a';
                    backgroundColor = '#d4edda';
                } else if (part.removed) {
                    // Red for deletions (like GitHub)
                    color = '#cb2431';
                    backgroundColor = '#ffdce0';
                    textDecorationLine = 'line-through';
                }

                return (
                    <Text
                        key={index}
                        style={[
                            styles.text,
                            {
                                color,
                                backgroundColor,
                                textDecorationLine,
                                paddingHorizontal: part.added || part.removed ? 2 : 0,
                            }
                        ]}
                    >
                        {part.value}
                    </Text>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.02)',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
    },
});

export default DiffView;


