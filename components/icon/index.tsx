import IcoMoon from "react-icomoon";
import { Svg, Path } from "react-native-svg";
const iconSet = require("./selection.json");

const Icon = ({ ...props }) => {
  return (
    <IcoMoon
      icon={props.icon}
      native
      iconSet={iconSet}
      SvgComponent={Svg}
      PathComponent={Path}
      {...props}
    />
  );
};

export default Icon;
