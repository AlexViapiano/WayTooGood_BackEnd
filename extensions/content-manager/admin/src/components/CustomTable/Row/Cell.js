import React, { memo, useState } from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@buffetjs/styles";
import MediaPreviewList from "../../MediaPreviewList";
import RelationPreviewList from "../../RelationPreviewList";
import Truncate from "../../Truncate";
import Truncated from "../../Truncated";
import styled from "styled-components";

// ----------------------- CUSTOM ----------------------
import { request } from "strapi-helper-plugin";

const StyledInput = styled.input`
  outline: 0;
  width: 100%;
`;

const StyledEditCell = styled.span`
  display: block;
  padding: 5px;
  border: 1px solid #ddd;
`;

const InlineTextEditCell = (props) => {
  const [inputValue, setInputValue] = useState(props.value);
  const onInputClick = (e) => {
    e.stopPropagation();
  };

  const onInputBlur = (e) => {
    if (props.onBlur) {
      props.onBlur(inputValue);
    }
  };

  return (
    <StyledEditCell onClick={(e) => e.stopPropagation()}>
      <StyledInput
        type={props.inputType}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onClick={onInputClick}
        onBlur={onInputBlur}
        {...props.inputProps}
      />
    </StyledEditCell>
  );
};
// ----------------------- CUSTOM ----------------------

const Cell = ({ options }) => {
  const [tooltipIsDisplayed, setDisplayTooltip] = useState(false);

  const handleTooltipToggle = () => {
    setDisplayTooltip((prev) => !prev);
  };

  const { type, cellId, value } = options;

  if (type === "media") {
    return <MediaPreviewList files={value} />;
  }

  if (type === "relation") {
    return <RelationPreviewList options={options} />;
  }

  // ----------------------- CUSTOM ----------------------
  const requestUpdate = async (value, name) => {
    try {
      const response = await request(
        `/content-manager/collection-types/application::product.product/${options.rowId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inventory: parseInt(value) }),
        },
        false,
        false
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (options.name == "inventory") {
    return (
      <InlineTextEditCell
        value={options.value}
        onBlur={(inputValue) => requestUpdate(inputValue, options.name)}
        inputProps={{ type: "number", min: 0 }}
      />
    );
  }
  // ----------------------- CUSTOM ----------------------

  return (
    <Truncate
      onMouseEnter={handleTooltipToggle}
      onMouseLeave={handleTooltipToggle}
    >
      <Truncated>
        <span data-for={cellId} data-tip={value}>
          {value}
        </span>
      </Truncated>
      {tooltipIsDisplayed && <Tooltip id={cellId} />}
    </Truncate>
  );
};

Cell.propTypes = {
  options: PropTypes.shape({
    cellId: PropTypes.string.isRequired,
    metadatas: PropTypes.shape({
      mainField: PropTypes.object,
    }).isRequired,
    name: PropTypes.string.isRequired,
    relationType: PropTypes.string,
    rowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string,
    queryInfos: PropTypes.shape({
      endPoint: PropTypes.string.isRequired,
    }),
    value: PropTypes.any,
  }).isRequired,
};

export default memo(Cell);
