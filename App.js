import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState([]);

  const notesDirectory = `${FileSystem.documentDirectory}notes/`;

  useEffect(() => {
    const createNotesDirectory = async () => {
      const dirInfo = await FileSystem.getInfoAsync(notesDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(notesDirectory, { intermediates: true });
      }
      loadNotes();
    };

    createNotesDirectory();
  }, []);

  const loadNotes = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(notesDirectory);
      setNotes(files);
    } catch (error) {
      Alert.alert('Error', `No se pudieron cargar las notas: ${error.message}`);
    }
  };

  const saveNote = async () => {
    if (!noteTitle || !noteContent) {
      Alert.alert('Error', 'Por favor ingresa un título y contenido para la nota.');
      return;
    }

    try {
      const filePath = `${notesDirectory}${noteTitle}.txt`;
      await FileSystem.writeAsStringAsync(filePath, noteContent);
      Alert.alert('Éxito', 'Nota guardada exitosamente.');
      setNoteTitle('');
      setNoteContent('');
      loadNotes();
    } catch (error) {
      Alert.alert('Error', `No se pudo guardar la nota: ${error.message}`);
    }
  };

  const viewNote = async (note) => {
    try {
      const filePath = `${notesDirectory}${note}`;
      const content = await FileSystem.readAsStringAsync(filePath);
      Alert.alert(note, content);
    } catch (error) {
      Alert.alert('Error', `No se pudo leer la nota: ${error.message}`);
    }
  };

  const deleteNote = async (note) => {
    try {
      const filePath = `${notesDirectory}${note}`;
      await FileSystem.deleteAsync(filePath);
      Alert.alert('Éxito', 'Nota eliminada.');
      loadNotes();
    } catch (error) {
      Alert.alert('Error', `No se pudo eliminar la nota: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bloc de Notas</Text>
      <TextInput
        style={styles.input}
        placeholder="Título de la nota"
        value={noteTitle}
        onChangeText={setNoteTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Contenido de la nota"
        value={noteContent}
        onChangeText={setNoteContent}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={saveNote}>
        <Text style={styles.buttonText}>Guardar Nota</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Notas Guardadas:</Text>
      <FlatList
        data={notes}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <TouchableOpacity onPress={() => viewNote(item)}>
              <Text style={styles.noteTitle}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteNote(item)}>
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F7FC',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3C5A99',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderColor: '#E1E1E1',
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#3C5A99',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  noteTitle: {
    fontSize: 18,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#E57373',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});