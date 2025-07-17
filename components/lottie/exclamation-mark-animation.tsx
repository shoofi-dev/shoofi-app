import LottieView from "lottie-react-native";
import { Image, Platform } from "react-native";
const exclamationMarkAnimation = require("../../assets/lottie/exclamation-mark.json");

export const ExclamationMarkLottie= () => (
  <Image
          style={{ alignSelf: "center", height:"100%", width:"100%" }}
          source={require("../../assets/shoofi/error-image.png")}
        />
  //   <LottieView
  //   source={exclamationMarkAnimation}
  //   autoPlay
  //   style={{
  //     width: 150,
  //     height: 150,
  //     marginTop: Platform.OS === "ios" ? -25 : 45,
  //     marginBottom: -60,
  //   }}
  //   loop={false}
  // />
)