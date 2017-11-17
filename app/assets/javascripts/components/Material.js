import React, {Component, PropTypes} from 'react';
import {Radio,FormControl, Button, InputGroup, OverlayTrigger, Tooltip,
        Label} from 'react-bootstrap';
import {DragSource} from 'react-dnd';
import DragDropItemTypes from './DragDropItemTypes';
import NumeralInputWithUnitsCompo from './NumeralInputWithUnitsCompo';
import SampleName from './common/SampleName';
import ElementActions from './actions/ElementActions';
import { UrlSilentNavigation, Alphabet } from './utils/ElementUtils';

const source = {
  beginDrag(props) {
    return props;
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

class Material extends Component {
  handleMaterialClick(sample) {
    let { reaction } = this.props;
    UrlSilentNavigation(sample);
    sample.updateChecksum();
    ElementActions.showReactionMaterial({ sample: sample, reaction: reaction });
  }

  notApplicableInput() {
    return (
      <td>
        <FormControl
          bsClass='bs-form--compact form-control'
          bsSize="small"
          style={{ textAlign: 'center'}}
          type="text"
          value="n/a"
          disabled={true}
        />
      </td>
    )
  }

  materialVolume(material) {
    if (material.contains_residues)
      return this.notApplicableInput();
    else
      return(
        <td>
          <NumeralInputWithUnitsCompo
            key={material.id}
            value={material.amount_l}
            unit='l'
            metricPrefix='milli'
            metricPrefixes = {['milli', 'none', 'micro']}
            precision={3}
            onChange={amount => this.handleAmountUnitChange(amount)}
            bsStyle={material.amount_unit === 'l' ? 'success' : 'default'}
          />
        </td>
      )
  }


  materialLoading(material, showLoadingColumn) {
    if(!showLoadingColumn) {
      return false;
    } else if (!material.contains_residues)
      return this.notApplicableInput();
    else {
      let disabled = this.props.materialGroup == 'products';
      return(
        <td>
          <NumeralInputWithUnitsCompo
            key={material.id}
            value={material.loading}
            unit='mmol/g'
            metricPrefix='none'
            metricPrefixes={['none']}
            bsStyle={material.error_loading ? 'error' : 'success'}
            precision={3}
            disabled={disabled}
            onChange={(loading) => this.handleLoadingChange(loading)}
          />
        </td>
      )
    }
  }

  materialRef(material) {
    return (
      this.props.materialGroup == 'products'
      ? <td />
      : <td>
          <Radio
            name="reference"
            checked={material.reference}
            onChange={event => this.handleReferenceChange(event)}
            bsSize="xsmall"
            style={{margin: 0}}
          />
        </td>
    )
  }

  render() {
    const { material, isDragging } = this.props;

    let style = { padding: "0" };
    if (isDragging) {
      style.opacity = 0.3;
    }

    if(this.props.materialGroup == 'products')
      material.amountType = 'real';//always take real amount for product

    return (
      this.props.materialGroup !== 'solvents'
        ? this.generalMaterial(this.props, style)
        : this.solventMaterial(this.props, style)
    )
  }

  equivalentOrYield(material) {
    if(this.props.materialGroup == 'products') {
      return (
        <FormControl
          type="text"
          bsClass="bs-form--compact form-control"
          bsSize="small"
          value={`${((material.equivalent || 0 ) * 100).toFixed(0)}%`}
          disabled={true}
        />
      );
    } else {
      return (
        <NumeralInputWithUnitsCompo
          precision={4}
          value={material.equivalent}
          disabled={(material.reference && material.equivalent) !== false}
          onChange={(e) => this.handleEquivalentChange(e)}
        />
      );
    }
  }

  handleExternalLabelChange(event) {
    let value = event.target.value;

    if(this.props.onChange) {
       let event = {
         type: 'externalLabelChanged',
         materialGroup: this.props.materialGroup,
         sampleID: this.materialId(),
         externalLabel: value
       };
       this.props.onChange(event);
    }
  }

  handleExternalLabelCompleted() {
    if(this.props.onChange) {
       let event = {
         type: 'externalLabelCompleted'
       };
       this.props.onChange(event);
    }
  }

  handleReferenceChange(event) {
    let value = event.target.value;

    if(this.props.onChange) {
       let event = {
         type: 'referenceChanged',
         materialGroup: this.props.materialGroup,
         sampleID: this.materialId(),
         value: value
       };
       this.props.onChange(event);
    }
  }

  handleAmountTypeChange(amountType) {
    if(this.props.onChange) {
      let event = {
        type: 'amountTypeChanged',
        materialGroup: this.props.materialGroup,
        sampleID: this.materialId(),
        amountType: amountType
      };
      this.props.onChange(event);
    }
  }

  handleAmountChange(amount) {

    if(this.props.onChange) {
      let event = {
        type: 'amountChanged',
        materialGroup: this.props.materialGroup,
        sampleID: this.materialId(),
        amount: amount
      };
      this.props.onChange(event);
    }
  }

  handleAmountUnitChange(amount) {
    if(this.props.onChange) {
      let event = {
        type: 'amountUnitChanged',
        materialGroup: this.props.materialGroup,
        sampleID: this.materialId(),
        amount: amount
      };
      this.props.onChange(event);
    }
  }

  handleLoadingChange(newLoading) {
    this.props.material.residues[0].custom_info.loading = newLoading.value;

    // just recalculate value in mg using the new loading value
    if(this.props.onChange) {
      let event = {
        type: 'amountChanged',
        materialGroup: this.props.materialGroup,
        sampleID: this.materialId(),
        amount: this.props.material.amount
      };
      this.props.onChange(event);
    }
  }

  handleUnitChange(unit, nextUnit, value) {

    if(this.props.onChange) {
      let event = {
        type: 'unitChanged',
        materialGroup: this.props.materialGroup,
        sampleID: this.materialId(),
        unitChange: {
          unit: unit,
          nextUnit: nextUnit,
          value: value
        }
      };
      this.props.onChange(event);
    }

    //TODO: currently returns the convertedValue, but we should set it from outside
    return value
  }

  handleEquivalentChange(e) {
    let equivalent = e.value;

    if(this.props.onChange) {
      let event = {
        type: 'equivalentChanged',
        materialGroup: this.props.materialGroup,
        sampleID: this.materialId(),
        equivalent: equivalent
      };
      this.props.onChange(event);
    }
  }

  materialId() {
    return this.material().id
  }

  material() {
    return this.props.material
  }

  generalMaterial(props) {
    const { material, deleteMaterial, connectDragSource,
            showLoadingColumn, reaction } = props;
    const isTarget = material.amountType === 'target'
    const massBsStyle = material.amount_unit === 'g' ? 'success' : 'default'

    const mol = material.amount_mol;
    const concn = mol / reaction.solventVolume;

    return (
      <tr className="general-material">
        {connectDragSource(
          <td className="drag-source">
            <span className='text-info fa fa-arrows'></span>
          </td>,
          {dropEffect: 'copy'}
        )}

        <td style={{width: "25%", maxWidth: "50px"}}>
          {this.materialNameWithIupac(material)}
        </td>

        {this.materialRef(material)}

        <td>
          {this.switchTargetReal(isTarget)}
        </td>

        <td>
          <NumeralInputWithUnitsCompo
            key={material.id}
            value={material.amount_g}
            unit='g'
            metricPrefix='milli'
            metricPrefixes = {['milli','none','micro']}
            precision={4}
            onChange={(amount) => this.handleAmountUnitChange(amount)}
            bsStyle={material.error_mass ? 'error' : massBsStyle}
          />
        </td>

        {this.materialVolume(material)}

        <td>
          <NumeralInputWithUnitsCompo
            key={material.id}
            value={material.amount_mol}
            unit='mol'
            metricPrefix='milli'
            metricPrefixes = {['milli','none']}
            precision={4}
            disabled={this.props.materialGroup == 'products'}
            onChange={(amount) => this.handleAmountUnitChange(amount)}
            bsStyle={ material.amount_unit === 'mol' ? 'success' : 'default' }
          />
        </td>

        {this.materialLoading(material, showLoadingColumn)}

        <td>
          <NumeralInputWithUnitsCompo
            key={material.id}
            value={concn}
            unit='mol/l'
            metricPrefix='milli'
            metricPrefixes = {['milli','none']}
            precision={4}
            disabled={true}
            onChange={(amount) => this.handleAmountUnitChange(amount)}
          />
        </td>

        <td>
          {this.equivalentOrYield(material)}
        </td>
        <td>
          <Button
            bsStyle="danger"
            bsSize="small"
            onClick={() => deleteMaterial(material)}
          >
            <i className="fa fa-trash-o" />
          </Button>
        </td>
      </tr>
    );
  }

  toggleTarget(isTarget) {
    if(this.props.materialGroup != 'products')
      this.handleAmountTypeChange(!isTarget ? 'target' : 'real')
  }

  solventMaterial(props) {
    const {material, deleteMaterial, connectDragSource } = props;
    const isTarget = material.amountType === 'target'

    return (
      <tr className="solvent-material">
        {connectDragSource(
          <td className='drag-source'>
            <span className='text-info fa fa-arrows'></span>
          </td>,
          {dropEffect: 'copy'}
        )}

        <td style={{width: "25%", maxWidth: "50px"}}>
          {this.materialNameWithIupac(material)}
        </td>
        <td>
          {this.switchTargetReal(isTarget)}
        </td>

        <td>
          <InputGroup>
            <FormControl
              type="text"
              bsClass="bs-form--compact form-control"
              bsSize="small"
              value={material.external_label}
              placeholder={material.molecule.iupac_name}
              onChange={event => this.handleExternalLabelChange(event)} />
            <InputGroup.Button>
              <OverlayTrigger placement="bottom" overlay={this.refreshSvgTooltip()}>
                <Button
                  active
                  onClick={e => this.handleExternalLabelCompleted()}
                  bsSize="small"
                >
                  <i className="fa fa-refresh"></i>
                </Button>
              </OverlayTrigger>
            </InputGroup.Button>
          </InputGroup>
        </td>

        {this.materialVolume(material)}

        <td>
          <FormControl
            type="text"
            bsClass="bs-form--compact form-control"
            bsSize="small"
            value={this.solvConcentration(material, props.reaction.solventVolume)}
            disabled={true}
          />
        </td>

        <td>
          <Button
            bsStyle="danger"
            bsSize="small"
            onClick={() => deleteMaterial(material)} >
            <i className="fa fa-trash-o"></i>
          </Button>
        </td>
      </tr>
    )
  }

  switchTargetReal(isTarget, style={padding: "5px 4px"}) {
    return (
      <Button active
              style= {style}
              onClick={() => this.toggleTarget(isTarget)}
              bsStyle={isTarget ? 'success' : 'primary'}
              bsSize='small'
              >
        {isTarget ? 't' : 'r'}
      </Button>
    )
  }

  materialNameWithIupac(material) {
    // Skip shortLabel for reactants and solvents
    let skipIupacName = this.props.materialGroup == 'reactants' ||
                        this.props.materialGroup == 'solvents'
    let materialName = ""
    let moleculeIupacName = ""
    let iupacStyle = {
      display: "block", whiteSpace: "nowrap", overflow: "hidden",
      textOverflow: "ellipsis", maxWidth: "100%"
    }

    var idCheck = /^\d+$/

    if (skipIupacName) {
      let materialDisplayName = material.molecule_iupac_name || material.name
      if(this.props.materialGroup == 'solvents') {
        materialDisplayName = material.external_label || materialDisplayName
      }
      if (materialDisplayName == null || materialDisplayName == "") {
        materialDisplayName = (
          <span>
            <SampleName sample={material}/>
          </span>
        )
      }

      if (idCheck.test(material.id)) {
        materialName =
          <a onClick={() => this.handleMaterialClick(material)}
             style={{cursor: 'pointer'}}>
            {materialDisplayName}
          </a>
      } else {
        materialName = <span>{materialDisplayName}</span>
      }
    } else {
      moleculeIupacName = material.molecule_iupac_name
      let materialDisplayName = material.title() == ""
                                ? <SampleName sample={material}/>
                                : material.title()
      materialName = (
        <a onClick={() => this.handleMaterialClick(material)} style={{cursor: 'pointer'}}>
          {materialDisplayName}
        </a>
      )

      if (material.isNew) materialName = materialDisplayName
    }
    let br = <br />
    if (moleculeIupacName == "") {
      iupacStyle = {display: "none"}
      br = ""
    }
    const mAlphabet = Alphabet(this.props.index);

    return (
      <OverlayTrigger placement="bottom" overlay={this.iupacNameTooltip(material.molecule.iupac_name)}>
        <div style={{display: "inline-block", maxWidth: "100%"}}>
          <div className="inline-inside">
            <Label bsStyle="primary">{mAlphabet}</Label>&nbsp;
            {materialName}
          </div>
          <span style={iupacStyle}>
            {moleculeIupacName}
          </span>
        </div>
      </OverlayTrigger>
    )
  }

  solvConcentration(material, solventVolume) {
    const concn = (material.amount_l / solventVolume * 100).toFixed(1);
    const nanOrInfinity = isNaN(concn) || !isFinite(concn)
    if (nanOrInfinity){
      return 'n.d.';
    } else {
      return `${concn}%`;
    }
  }

  refreshSvgTooltip() {
    return(
      <Tooltip id="refresh_svg_tooltip">Refresh reaction diagram</Tooltip>
    )
  }

  iupacNameTooltip(iupacName) {
    return(
      <Tooltip id="iupac_name_tooltip">{iupacName}</Tooltip>
    )
  }
}

export default DragSource(DragDropItemTypes.MATERIAL, source, collect)(Material);

Material.propTypes = {
  reaction: PropTypes.object.isRequired,
  material: PropTypes.object.isRequired,
  materialGroup: PropTypes.string.isRequired,
  deleteMaterial: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  showLoadingColumn: PropTypes.object,
};
