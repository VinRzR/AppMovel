import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  Vibration,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Audio } from "expo-av";

//ip emulador 10.0.2.2:7379
//lan 192.168.1.4:7379
function Subscribe({ navigation }) {
  var previous_response_length = 0;
  xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    "https://c335-179-108-16-34.sa.ngrok.io/SUBSCRIBE/alert",
    true
  );
  xhr.onreadystatechange = checkData;
  xhr.send(null);

  function checkData() {
    if (xhr.readyState == 3) {
      response = xhr.responseText;
      chunk = response.slice(previous_response_length);
      previous_response_length = response.length;
      //console.log(JSON.parse(chunk));
      const chunk_parse = JSON.parse(chunk);
      if (chunk_parse.SUBSCRIBE[0] === "message") {
        navigation.navigate("Alerta", chunk_parse);
      }
    }
  }
}

async function Publish(json) {
  var status;
  try {
    const response = await fetch(
      `https://c335-179-108-16-34.sa.ngrok.io/PUBLISH/createIncident/${JSON.stringify(
        json
      )}`
    );
    //console.log(response.status);
    status = response.status;
  } catch (error) {
    console.error(error);
  } finally {
    //console.log(status);
    if (status === 200) {
      Alert.alert("Incidente Enviado");
      navigation.navigate("Home");
    } else {
      Alert.alert("Erro ao Enviar o Incidente");
    }
    return response.status;
  }
}

function HomeScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <Text>Incidentes</Text>
      <Button
        title="Reportar Incidente"
        onPress={() => navigation.navigate("Form")}
      />
      <Button
        title="Inscrever-se para Alertas"
        onPress={() => Subscribe({ navigation })}
      />
    </View>
  );
}

function FormScreen({ navigation }) {
  const [description, setDescription] = useState(null);
  const [city, setCity] = useState(null);
  const [cep, setCep] = useState(null);
  const [street, setStreet] = useState(null);
  const [gravity, setGravity] = useState(null);

  const [isLoading, setLoading] = useState(true);
  var statusResponse;

  const data_json = {
    description: "boeiro entupido",
    city: "Itajubá",
    cep: "3751700",
    street: "varginha",
    gravity: 1,
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Formulário de Incidente</Text>
      <Text>Insira a Descrição:</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        onChangeText={(val) => setDescription(val)}
      />
      <Text>Cidade:</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        onChangeText={(val) => setCity(val)}
      />
      <Text>Cep:</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        onChangeText={(val) => setCep(val)}
      />
      <Text>Rua:</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        onChangeText={(val) => setStreet(val)}
      />
      <Text>Gravidade:</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        onChangeText={(val) => setGravity(val)}
      />
      <Button
        title="Publicar"
        onPress={() => {
          // if(description && city && cep && street && gravity)
          Publish({
            description: description,
            city: city,
            cep: cep,
            street: street,
            gravity: gravity,
          });
        }}
      />
      <Button title="Go to Home" onPress={() => navigation.navigate("Home")} />
    </View>
  );
}

function AlertaScreen({ route, navigation }) {
  const chunk = route.params;
  const [sound, setSound] = React.useState();

  async function playSound() {
    //console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/alarm.wav")
    );
    setSound(sound);

    //console.log("Playing Sound");
    await sound.playAsync();
  }

  useEffect(() => {
    playSound();
  }, []);

  Vibration.vibrate([200, 200], true);
  return (
    <View style={styles.alert}>
      <Text style={styles.alert_font}>{chunk.SUBSCRIBE[2]}</Text>
      <Button
        title="OK"
        onPress={() => {
          Vibration.cancel();
          navigation.navigate("Home");
          sound.unloadAsync();
        }}
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="Alerta" component={AlertaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddindTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#777",
    padding: 8,
    margin: 10,
    width: 200,
  },
  alert: {
    backgroundColor: "#f00",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  alert_font: {
    color: "#fff",
    fontSize: 40,
  },
});
